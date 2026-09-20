import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import bookImage from "../../assets/book.png";
import { 
    X,
    File,
    Eye,
    Download,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FolderDown,
    Sheet,
    FileUp,
    FileDown,
    Forward,
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
    Tag,
    Paperclip,
    Navigation,
    Users,
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    MoreVertical,
    Plus
} from 'lucide-react';

// Helper functions at the top level
const getDefaultCheckInDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const getDefaultCheckOutDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

export default function HotelRoomListing() {
    const { id } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    
    // Tab state
    const [activeTab, setActiveTab] = useState("pnr");
    
    // Sub-tab states for flight direction
    const [transitDirectionTab, setTransitDirectionTab] = useState("onward");
    const [finalDestinationDirectionTab, setFinalDestinationDirectionTab] = useState("onward");
    
    // PNR Passengers state
    const [pnrPassengers, setPnrPassengers] = useState([]);
    const [pnrLoading, setPnrLoading] = useState(false);
    const [pnrError, setPnrError] = useState("");
    
    const [expandedHotels, setExpandedHotels] = useState({});
    const [hotelWiseSearchTerm, setHotelWiseSearchTerm] = useState("");
    
    // Hotel Listing for dropdown
    const [availableHotels, setAvailableHotels] = useState([]);
    const [hotelsLoading, setHotelsLoading] = useState(false);
    
    // Form state for hotel assignment
    const [hotelAssignments, setHotelAssignments] = useState({});
    const [enabled, setEnabled] = useState(false);
    
    // Selected PNRs for batch operations
    const [selectedPnrRows, setSelectedPnrRows] = useState([]);
    
    // Selected passengers for multi-assign in Transit tab (onward/return)
    const [selectedTransitOnwardPassengers, setSelectedTransitOnwardPassengers] = useState([]);
    const [selectedTransitReturnPassengers, setSelectedTransitReturnPassengers] = useState([]);
    
    // Selected passengers for multi-assign in Final Destination tab (onward/return)
    const [selectedFinalOnwardPassengers, setSelectedFinalOnwardPassengers] = useState([]);
    const [selectedFinalReturnPassengers, setSelectedFinalReturnPassengers] = useState([]);
    
    // Selected passengers for Pre Hotel (unified - no direction)
    const [selectedPreHotelPassengers, setSelectedPreHotelPassengers] = useState([]);
    
    // Selected passengers for Post Hotel (unified - no direction)
    const [selectedPostHotelPassengers, setSelectedPostHotelPassengers] = useState([]);
    
    const [CallPop, setCallPop] = useState(false);
    
    // Room types
    const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Family", "Transit Hotel"];
    const ActionFil = ["Same", "Family", "Group"];
    const StayType = ["Hotel", "Lounge"];
    const guestTypes = ["Child", "Teenager", "Adult", "Business", "Leisure", "Transit", "Group", "Family", "Couple"];
    const flightDirections = ["onward", "return"];
    
    // Transit Flight Hotels data - separated by direction
    const [transitOnwardFlights, setTransitOnwardFlights] = useState([]);
    const [transitReturnFlights, setTransitReturnFlights] = useState([]);
    
    // Final Destination data - separated by direction
    const [finalOnwardDestinations, setFinalOnwardDestinations] = useState([]);
    const [finalReturnDestinations, setFinalReturnDestinations] = useState([]);
    
    // Import/Export for room numbers
    const [showRoomImportModal, setShowRoomImportModal] = useState(false);
    const [importContext, setImportContext] = useState({ tab: '', direction: '' });
    const [importFile, setImportFile] = useState(null);
    const [importProcessing, setImportProcessing] = useState(false);
    
    // Settings state
    const [settings, setSettings] = useState({
        autoRefresh: true,
        refreshInterval: 30,
        defaultRoomType: "Standard",
        defaultStatus: "Available",
        enableNotifications: true,
        exportFormat: "csv",
        transitMinHours: 4,
        transitMaxHours: 24,
        enableTransitFilter: true
    });

    // Pagination states
    const [currentPnrPage, setCurrentPnrPage] = useState(0);
    const [pnrPerPage] = useState(10);
    const [currentTransitOnwardPage, setCurrentTransitOnwardPage] = useState(0);
    const [currentTransitReturnPage, setCurrentTransitReturnPage] = useState(0);
    const [transitPerPage] = useState(10);
    const [currentFinalOnwardPage, setCurrentFinalOnwardPage] = useState(0);
    const [currentFinalReturnPage, setCurrentFinalReturnPage] = useState(0);
    const [finalPerPage] = useState(10);
    const [currentPreHotelPage, setCurrentPreHotelPage] = useState(0);
    const [preHotelPerPage] = useState(10);
    const [currentPostHotelPage, setCurrentPostHotelPage] = useState(0);
    const [postHotelPerPage] = useState(10);

    // Search terms
    const [pnrSearchTerm, setPnrSearchTerm] = useState("");
    const [transitOnwardSearchTerm, setTransitOnwardSearchTerm] = useState("");
    const [transitReturnSearchTerm, setTransitReturnSearchTerm] = useState("");
    const [finalOnwardSearchTerm, setFinalOnwardSearchTerm] = useState("");
    const [finalReturnSearchTerm, setFinalReturnSearchTerm] = useState("");
    const [preHotelSearchTerm, setPreHotelSearchTerm] = useState("");
    const [postHotelSearchTerm, setPostHotelSearchTerm] = useState("");

    // Hotel assignment states
    const [assigningHotel, setAssigningHotel] = useState(null);
    const [assignmentError, setAssignmentError] = useState(null);
    const [assignmentSuccess, setAssignmentSuccess] = useState(null);
    
    // Multi-assign state for batch hotel assignment
    const [multiAssignHotel, setMultiAssignHotel] = useState({
        hotelId: "",
        hotelType: "destination",
        flightDirection: "onward",
        checkInDate: getDefaultCheckInDate(),
        checkOutDate: getDefaultCheckOutDate(),
        roomType: "Standard",
        roomCount: 1,
        guestCount: 1,
        isAssigning: false
    });

    // ===== PER-PASSENGER STAY TYPE AND SHARE WITH M =====
    const [passengerStayTypes, setPassengerStayTypes] = useState({});
    const [passengerShareWithM, setPassengerShareWithM] = useState({});
    const [selectedStayType, setSelectedStayType] = useState('hotel');
    const [selectedShareWithM, setSelectedShareWithM] = useState('same');

    // Transit sub-tab
    const [transitSubTab, setTransitSubTab] = useState("preHotel");

    // Pre Hotel states (UNIFIED - NO DIRECTION)
    const [preHotelPassengers, setPreHotelPassengers] = useState([]);

    // Post Hotel states (UNIFIED - NO DIRECTION)
    const [postHotelPassengers, setPostHotelPassengers] = useState([]);

    // Validation and grouping states
    const [validationSelections, setValidationSelections] = useState({});
    const [groupingSelections, setGroupingSelections] = useState({});
    const [showValidationDropdown, setShowValidationDropdown] = useState(null);
    const [showGroupingDropdown, setShowGroupingDropdown] = useState(null);

    // Notification templates
    const [notificationTemplates, setNotificationTemplates] = useState([]);
    const [showTemplatePopup, setShowTemplatePopup] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        subject: "",
        content: "",
        isActive: true,
        type: "email",
        recipients: []
    });

    const [users, setUsers] = useState([
        { name: "Akshay Kaul", email: "akshayk@hiwalk.in", license: "Microsoft 365 Business Basic" },
    ]);

    // ==================== LABEL MANAGEMENT ====================
    const [showLabelPopup, setShowLabelPopup] = useState(false);
    const [labelText, setLabelText] = useState("");
    const [labelColor, setLabelColor] = useState("#3B82F6");
    const [labelPriority, setLabelPriority] = useState("medium");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [labels, setLabels] = useState({});

    // Transit stay types
    const [transitStayTypes, setTransitStayTypes] = useState([
        { minHours: 2, maxHours: 4, stayType: "Lounge" },
        { minHours: 4, maxHours: 24, stayType: "Hotel" }
    ]);

    const [showAddStayTypePopup, setShowAddStayTypePopup] = useState(false);
    const [newStayTypeConfig, setNewStayTypeConfig] = useState({
        minHours: 4,
        maxHours: 8,
        stayType: "Hotel"
    });

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

    // ==================== ROOM NUMBER ASSIGNMENT STATE ====================
    const [showRoomAssignmentModal, setShowRoomAssignmentModal] = useState(false);
    const [showBatchRoomModal, setShowBatchRoomModal] = useState(false);
    const [roomAssignmentData, setRoomAssignmentData] = useState({
        pnrId: null,
        passengerIndex: null,
        passengerName: '',
        roomNumber: '',
        hotelType: 'destination',
        flightDirection: 'onward',
        paxCode: '',
        leadId: null
    });
    const [batchRoomData, setBatchRoomData] = useState({
        pnrId: null,
        leadId: null,
        assignments: [],
        hotelType: 'destination',
        flightDirection: 'onward',
        roomNumberPattern: ''
    });
    const [roomAssignmentLoading, setRoomAssignmentLoading] = useState(false);

    // ==================== DATE CALCULATION FUNCTIONS ====================

    const getStayTypeForGap = (gapHours) => {
        if (!gapHours || gapHours === 0) return "Hotel";
        const matchingConfig = transitStayTypes.find(
            config => gapHours >= config.minHours && gapHours < config.maxHours
        );
        return matchingConfig ? matchingConfig.stayType : "Hotel";
    };

    const calculatePreHotelDates = (segments) => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        if (!flightSegments || flightSegments.length === 0) {
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                stayDuration: 1,
                message: `No flight segments found for pre-hotel`
            };
        }
        const sortedSegments = [...flightSegments].sort((a, b) => a.segment_order - b.segment_order);
        const firstSegment = sortedSegments[0];
        if (firstSegment.departure_date && firstSegment.departure_time) {
            try {
                const departureDateTimeStr = `${firstSegment.departure_date}T${firstSegment.departure_time}:00`;
                const departureDateTime = new Date(departureDateTimeStr);
                if (isNaN(departureDateTime.getTime())) {
                    throw new Error(`Invalid departure date format`);
                }
                const checkInDateTime = new Date(departureDateTime);
                checkInDateTime.setDate(checkInDateTime.getDate() - 1);
                const checkInDate = checkInDateTime.toISOString().split('T')[0];
                const checkOutDate = firstSegment.departure_date;
                return {
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    stayDuration: 1,
                    departureDate: checkOutDate,
                    departureAirport: firstSegment.from_airport || firstSegment.departure_airport,
                    departureDateTime: departureDateTimeStr,
                    firstFlightNumber: firstSegment.flight_number,
                    message: `Pre-hotel before departure from ${firstSegment.from_airport || firstSegment.departure_airport}`,
                    flightDirection: firstSegment.flight_direction || "onward"
                };
            } catch (error) {
                console.error(`Error calculating pre-hotel dates:`, error);
                return {
                    checkIn: getDefaultCheckInDate(),
                    checkOut: getDefaultCheckOutDate(),
                    stayDuration: 1,
                    error: `Calculation error: ${error.message}`
                };
            }
        }
        return {
            checkIn: getDefaultCheckInDate(),
            checkOut: getDefaultCheckOutDate(),
            stayDuration: 1,
            message: `Using default dates for pre-hotel`
        };
    };

    const calculatePostHotelDates = (segments, passengerData) => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        if (!flightSegments || flightSegments.length === 0) {
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                stayDuration: 1,
                message: `No flight segments found for post-hotel`
            };
        }
        const sortedSegments = [...flightSegments].sort((a, b) => a.segment_order - b.segment_order);
        const lastSegment = sortedSegments[sortedSegments.length - 1];
        if (lastSegment.arrival_date && lastSegment.arrival_time) {
            try {
                const arrivalDateTimeStr = `${lastSegment.arrival_date}T${lastSegment.arrival_time}:00`;
                const arrivalDateTime = new Date(arrivalDateTimeStr);
                if (isNaN(arrivalDateTime.getTime())) {
                    throw new Error(`Invalid arrival date format`);
                }
                const checkInDate = lastSegment.arrival_date;
                const checkOutDateTime = new Date(arrivalDateTime);
                checkOutDateTime.setDate(checkOutDateTime.getDate() + 1);
                const checkOutDate = checkOutDateTime.toISOString().split('T')[0];
                return {
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    stayDuration: 1,
                    arrivalDate: checkInDate,
                    arrivalAirport: lastSegment.to_airport || lastSegment.arrival_airport,
                    arrivalDateTime: arrivalDateTimeStr,
                    lastFlightNumber: lastSegment.flight_number,
                    message: `Post-hotel after arrival at ${lastSegment.to_airport || lastSegment.arrival_airport}`,
                    flightDirection: lastSegment.flight_direction || "onward"
                };
            } catch (error) {
                console.error(`Error calculating post-hotel dates:`, error);
                return {
                    checkIn: getDefaultCheckInDate(),
                    checkOut: getDefaultCheckOutDate(),
                    stayDuration: 1,
                    error: `Calculation error: ${error.message}`
                };
            }
        }
        return {
            checkIn: getDefaultCheckInDate(),
            checkOut: getDefaultCheckOutDate(),
            stayDuration: 1,
            message: `Using default dates for post-hotel`
        };
    };

    const calculateTransitHotelDates = (segments, direction = "onward") => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        const directionSegments = direction === "onward" 
            ? flightSegments.filter(s => s.flight_direction === "onward" || !s.flight_direction)
            : flightSegments.filter(s => s.flight_direction === "return");
        if (!directionSegments || directionSegments.length < 2) {
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false,
                message: `Insufficient ${direction} flight segments for transit hotel`
            };
        }
        const sortedSegments = [...directionSegments].sort((a, b) => a.segment_order - b.segment_order);
        const firstSegment = sortedSegments[0];
        const secondSegment = sortedSegments[1];
        if (!firstSegment.arrival_date || !firstSegment.arrival_time || 
            !secondSegment.departure_date || !secondSegment.departure_time) {
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false,
                error: `Missing arrival/departure times in ${direction} flight segments`
            };
        }
        try {
            const arrivalDateTimeStr = `${firstSegment.arrival_date}T${firstSegment.arrival_time}:00`;
            const departureDateTimeStr = `${secondSegment.departure_date}T${secondSegment.departure_time}:00`;
            const arrivalDateTime = new Date(arrivalDateTimeStr);
            const departureDateTime = new Date(departureDateTimeStr);
            if (isNaN(arrivalDateTime.getTime()) || isNaN(departureDateTime.getTime())) {
                return {
                    checkIn: getDefaultCheckInDate(),
                    checkOut: getDefaultCheckOutDate(),
                    gapHours: 0,
                    gapMinutes: 0,
                    hasGap: false,
                    error: `Invalid date format in ${direction} flight segments`
                };
            }
            const gapMs = departureDateTime - arrivalDateTime;
            if (gapMs < 0) {
                return {
                    checkIn: getDefaultCheckInDate(),
                    checkOut: getDefaultCheckOutDate(),
                    gapHours: 0,
                    gapMinutes: 0,
                    hasGap: false,
                    error: `Departure time is before arrival time in ${direction} journey`
                };
            }
            const gapHours = Math.floor(gapMs / (1000 * 60 * 60));
            const gapMinutes = Math.floor((gapMs % (1000 * 60 * 60)) / (1000 * 60));
            if (gapMs < 4 * 60 * 60 * 1000) {
                return {
                    checkIn: arrivalDateTime.toISOString().split('T')[0],
                    checkOut: departureDateTime.toISOString().split('T')[0],
                    gapHours: gapHours,
                    gapMinutes: gapMinutes,
                    hasGap: false,
                    message: `Gap too small for ${direction} transit hotel (${gapHours}h ${gapMinutes}m, minimum 4 hours required)`
                };
            }
            const checkInTime = new Date(arrivalDateTime.getTime() + 30 * 60 * 1000);
            const checkOutTime = new Date(departureDateTime.getTime() - 2 * 60 * 60 * 1000);
            if (checkOutTime <= checkInTime) {
                const nextDay = new Date(arrivalDateTime);
                nextDay.setDate(nextDay.getDate() + 1);
                return {
                    checkIn: arrivalDateTime.toISOString().split('T')[0],
                    checkOut: nextDay.toISOString().split('T')[0],
                    gapHours: gapHours,
                    gapMinutes: gapMinutes,
                    hasGap: true,
                    isSameDay: false,
                    message: `Overnight ${direction} transit hotel recommended`
                };
            }
            return {
                checkIn: checkInTime.toISOString().split('T')[0],
                checkOut: checkOutTime.toISOString().split('T')[0],
                gapHours: gapHours,
                gapMinutes: gapMinutes,
                hasGap: true,
                isSameDay: checkInTime.toDateString() === checkOutTime.toDateString(),
                arrivalDateTime: arrivalDateTimeStr,
                departureDateTime: departureDateTimeStr,
                arrivalAirport: firstSegment.to_airport || firstSegment.arrival_airport,
                departureAirport: secondSegment.from_airport || secondSegment.departure_airport,
                message: `${direction.charAt(0).toUpperCase() + direction.slice(1)} transit hotel recommended (${gapHours}h ${gapMinutes}m gap)`,
                flightDirection: direction
            };
        } catch (error) {
            console.error(`Error calculating ${direction} transit dates:`, error);
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false,
                error: `Calculation error: ${error.message}`
            };
        }
    };

    const calculateFinalDestinationDates = (segments, passengerData, direction = "onward") => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        const directionSegments = direction === "onward" 
            ? flightSegments.filter(s => s.flight_direction === "onward" || !s.flight_direction)
            : flightSegments.filter(s => s.flight_direction === "return");
        if (!directionSegments || directionSegments.length === 0) {
            return {
                checkIn: getDefaultCheckInDate(),
                checkOut: getDefaultCheckOutDate(),
                stayDuration: 1,
                arrivalDate: null,
                arrivalAirport: null,
                message: `No ${direction} flight segments found`
            };
        }
        const sortedSegments = [...directionSegments].sort((a, b) => a.segment_order - b.segment_order);
        const lastSegment = sortedSegments[sortedSegments.length - 1];
        if (lastSegment.arrival_date && lastSegment.arrival_time) {
            try {
                const arrivalDateTimeStr = `${lastSegment.arrival_date}T${lastSegment.arrival_time}:00`;
                const arrivalDateTime = new Date(arrivalDateTimeStr);
                if (isNaN(arrivalDateTime.getTime())) {
                    throw new Error(`Invalid arrival date format in ${direction} segment`);
                }
                const checkInDate = arrivalDateTime.toISOString().split('T')[0];
                const checkOutDateTime = new Date(arrivalDateTime);
                checkOutDateTime.setDate(checkOutDateTime.getDate() + 1);
                const checkOutDate = checkOutDateTime.toISOString().split('T')[0];
                const stayDuration = Math.ceil(
                    (checkOutDateTime - arrivalDateTime) / (1000 * 60 * 60 * 24)
                );
                return {
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    stayDuration: stayDuration || 1,
                    arrivalDate: checkInDate,
                    arrivalAirport: lastSegment.to_airport || lastSegment.arrival_airport,
                    arrivalDateTime: arrivalDateTimeStr,
                    lastFlightNumber: lastSegment.flight_number,
                    message: `${direction.charAt(0).toUpperCase() + direction.slice(1)} destination hotel after arrival at ${lastSegment.to_airport || lastSegment.arrival_airport}`,
                    flightDirection: direction
                };
            } catch (error) {
                console.error(`Error calculating ${direction} final destination dates:`, error);
                return {
                    checkIn: getDefaultCheckInDate(),
                    checkOut: getDefaultCheckOutDate(),
                    stayDuration: 1,
                    arrivalDate: null,
                    arrivalAirport: null,
                    error: `Calculation error: ${error.message}`
                };
            }
        }
        return {
            checkIn: getDefaultCheckInDate(),
            checkOut: getDefaultCheckOutDate(),
            stayDuration: 1,
            arrivalDate: null,
            arrivalAirport: null,
            message: `Using default dates for ${direction}`
        };
    };

    // ==================== ROOM NUMBER API FUNCTIONS ====================

    // Assign a single room number - By PNR ID and Passenger Index
    const assignRoomNumber = async (pnrId, passengerIndex, roomNumber, hotelType = 'destination', flightDirection = 'onward', leadId = null) => {
        try {
            const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
            const url = `${API_BASE_URL}/hotels/pnr/${pnrId}/passenger/${passengerIndex}/room-number`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_number: roomNumber,
                    hotel_type: hotelType,
                    flight_direction: flightDirection,
                    lead_id: leadId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to assign room number');
            }
            
            return result;
            
        } catch (error) {
            console.error('Error assigning room number:', error);
            throw error;
        }
    };

    // Assign a single room number - By Pax Code
    const assignRoomNumberByPax = async (paxCode, roomNumber, hotelType = 'destination', flightDirection = 'onward', leadId = null) => {
        try {
            const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
            const url = `${API_BASE_URL}/hotels/pax/${paxCode}/room-number`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_number: roomNumber,
                    hotel_type: hotelType,
                    flight_direction: flightDirection,
                    lead_id: leadId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to assign room number');
            }
            
            return result;
            
        } catch (error) {
            console.error('Error assigning room number by pax:', error);
            throw error;
        }
    };

    // Batch assign room numbers - By PNR ID
    const batchAssignRoomNumbers = async (pnrId, assignments, hotelType = 'destination', flightDirection = 'onward', leadId = null) => {
        try {
            const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
            const url = `${API_BASE_URL}/hotels/pnr/${pnrId}/passengers/room-numbers`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignments: assignments,
                    hotel_type: hotelType,
                    flight_direction: flightDirection,
                    lead_id: leadId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to assign room numbers');
            }
            
            return result;
            
        } catch (error) {
            console.error('Error batch assigning room numbers:', error);
            throw error;
        }
    };

    // Batch assign room numbers - By Pax Code
    const batchAssignRoomNumbersByPax = async (paxCode, assignments, hotelType = 'destination', flightDirection = 'onward', leadId = null) => {
        try {
            const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
            const url = `${API_BASE_URL}/hotels/pax/${paxCode}/passengers/room-numbers`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignments: assignments,
                    hotel_type: hotelType,
                    flight_direction: flightDirection,
                    lead_id: leadId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to assign room numbers');
            }
            
            return result;
            
        } catch (error) {
            console.error('Error batch assigning room numbers by pax:', error);
            throw error;
        }
    };

    // ==================== ROOM NUMBER UI HANDLERS ====================

    const handleOpenRoomAssignment = (passenger, hotelType = 'destination', flightDirection = 'onward') => {
        const leadId = passenger.pnrData?.leadId || 
                       passenger.lead_id || 
                       passenger.pnrData?.passenger?.lead_id || 
                       null;
        
        setRoomAssignmentData({
            pnrId: passenger.pnrData?.pnrId,
            passengerIndex: passenger.pnrData?.passengerIndex,
            passengerName: passenger.fullName,
            paxCode: passenger.paxCode || 'N/A',
            roomNumber: '',
            hotelType: hotelType,
            flightDirection: flightDirection,
            leadId: leadId
        });
        setShowRoomAssignmentModal(true);
    };

    const handleAssignRoomNumber = async () => {
        if (!roomAssignmentData.pnrId || roomAssignmentData.passengerIndex === null || !roomAssignmentData.roomNumber) {
            alert('Please fill in all required fields');
            return;
        }

        setRoomAssignmentLoading(true);

        try {
            const leadId = roomAssignmentData.leadId || null;
            
            if (roomAssignmentData.paxCode && roomAssignmentData.paxCode !== 'N/A') {
                const result = await assignRoomNumberByPax(
                    roomAssignmentData.paxCode,
                    roomAssignmentData.roomNumber,
                    roomAssignmentData.hotelType,
                    roomAssignmentData.flightDirection,
                    leadId
                );
                
                if (result.success) {
                    alert(`Room number ${roomAssignmentData.roomNumber} assigned to ${roomAssignmentData.passengerName} (${roomAssignmentData.paxCode}) successfully!`);
                    setShowRoomAssignmentModal(false);
                    fetchPnrPassengers();
                }
            } else {
                const result = await assignRoomNumber(
                    roomAssignmentData.pnrId,
                    roomAssignmentData.passengerIndex,
                    roomAssignmentData.roomNumber,
                    roomAssignmentData.hotelType,
                    roomAssignmentData.flightDirection,
                    leadId
                );
                
                if (result.success) {
                    alert(`Room number ${roomAssignmentData.roomNumber} assigned to ${roomAssignmentData.passengerName} successfully!`);
                    setShowRoomAssignmentModal(false);
                    fetchPnrPassengers();
                }
            }
        } catch (error) {
            alert('Error assigning room number: ' + error.message);
        } finally {
            setRoomAssignmentLoading(false);
        }
    };

    const handleOpenBatchRoomAssignment = (selectedPassengers, hotelType = 'destination', flightDirection = 'onward') => {
        if (selectedPassengers.length === 0) {
            alert('Please select at least one passenger');
            return;
        }

        const pnrId = selectedPassengers[0]?.pnrData?.pnrId;
        const leadId = selectedPassengers[0]?.pnrData?.leadId || 
                       selectedPassengers[0]?.lead_id || 
                       selectedPassengers[0]?.pnrData?.passenger?.lead_id || 
                       null;
        
        const assignments = selectedPassengers.map((p) => ({
            passengerIndex: p.pnrData?.passengerIndex,
            passengerName: p.fullName,
            paxCode: p.paxCode || 'N/A',
            roomNumber: p.roomNo || p.transitRoomNo || p.preHotelRoomNo || p.postHotelRoomNo || '',
            hotelType: hotelType,
            flightDirection: flightDirection
        }));

        setBatchRoomData({
            pnrId: pnrId,
            leadId: leadId,
            assignments: assignments,
            hotelType: hotelType,
            flightDirection: flightDirection,
            roomNumberPattern: ''
        });
        setShowBatchRoomModal(true);
    };

    const handleBatchAssignRoomNumbers = async () => {
        const invalidAssignments = batchRoomData.assignments.filter(a => !a.roomNumber?.trim());
        if (invalidAssignments.length > 0) {
            alert(`Please enter room numbers for all passengers. Missing: ${invalidAssignments.length} passenger(s)`);
            return;
        }

        if (!batchRoomData.pnrId) {
            alert('PNR ID is missing. Please try again.');
            return;
        }

        setRoomAssignmentLoading(true);

        try {
            const assignments = batchRoomData.assignments.map(a => ({
                passengerIndex: a.passengerIndex,
                roomNumber: a.roomNumber.trim(),
                hotelType: a.hotelType || batchRoomData.hotelType,
                flightDirection: a.flightDirection || batchRoomData.flightDirection,
                paxCode: a.paxCode || null
            }));

            const leadId = batchRoomData.leadId || null;
            
            const hasPaxCode = assignments.every(a => a.paxCode);
            
            let result;
            if (hasPaxCode && assignments.length > 0) {
                const paxCode = assignments[0].paxCode;
                result = await batchAssignRoomNumbersByPax(
                    paxCode,
                    assignments,
                    batchRoomData.hotelType,
                    batchRoomData.flightDirection,
                    leadId
                );
            } else {
                result = await batchAssignRoomNumbers(
                    batchRoomData.pnrId,
                    assignments,
                    batchRoomData.hotelType,
                    batchRoomData.flightDirection,
                    leadId
                );
            }

            if (result.success) {
                alert(`Successfully assigned room numbers to ${result.data.totalAssigned} passenger(s)!`);
                setShowBatchRoomModal(false);
                fetchPnrPassengers();
            }
        } catch (error) {
            alert('Error assigning room numbers: ' + error.message);
        } finally {
            setRoomAssignmentLoading(false);
        }
    };

    const applyRoomNumberPattern = () => {
        const pattern = batchRoomData.roomNumberPattern;
        if (!pattern) return;

        const updatedAssignments = batchRoomData.assignments.map((a, idx) => ({
            ...a,
            roomNumber: pattern.replace(/{index}/g, idx + 1)
        }));

        setBatchRoomData(prev => ({
            ...prev,
            assignments: updatedAssignments
        }));
    };

    const getSelectedPassengers = (hotelType, flightDirection) => {
        if (hotelType === 'preHotel') {
            return preHotelPassengers.filter(p => selectedPreHotelPassengers.includes(p.id));
        } else if (hotelType === 'postHotel') {
            return postHotelPassengers.filter(p => selectedPostHotelPassengers.includes(p.id));
        } else if (hotelType === 'transit') {
            if (flightDirection === 'onward') {
                return transitOnwardFlights.filter(p => selectedTransitOnwardPassengers.includes(p.id));
            } else {
                return transitReturnFlights.filter(p => selectedTransitReturnPassengers.includes(p.id));
            }
        } else {
            if (flightDirection === 'onward') {
                return finalOnwardDestinations.filter(p => selectedFinalOnwardPassengers.includes(p.id));
            } else {
                return finalReturnDestinations.filter(p => selectedFinalReturnPassengers.includes(p.id));
            }
        }
    };

    const getCurrentPnrId = () => {
        if (transitOnwardFlights.length > 0) {
            return transitOnwardFlights[0].pnrData?.pnrId;
        }
        if (transitReturnFlights.length > 0) {
            return transitReturnFlights[0].pnrData?.pnrId;
        }
        if (finalOnwardDestinations.length > 0) {
            return finalOnwardDestinations[0].pnrData?.pnrId;
        }
        if (finalReturnDestinations.length > 0) {
            return finalReturnDestinations[0].pnrData?.pnrId;
        }
        if (preHotelPassengers.length > 0) {
            return preHotelPassengers[0].pnrData?.pnrId;
        }
        if (postHotelPassengers.length > 0) {
            return postHotelPassengers[0].pnrData?.pnrId;
        }
        return null;
    };

    // ==================== HANDLER FUNCTIONS FOR TRANSIT AND FINAL DESTINATION ====================

    const handleTransitPassengerSelection = (passengerId, flightDirection) => {
        if (flightDirection === 'onward') {
            setSelectedTransitOnwardPassengers(prev => {
                if (prev.includes(passengerId)) {
                    return prev.filter(id => id !== passengerId);
                } else {
                    return [...prev, passengerId];
                }
            });
        } else {
            setSelectedTransitReturnPassengers(prev => {
                if (prev.includes(passengerId)) {
                    return prev.filter(id => id !== passengerId);
                } else {
                    return [...prev, passengerId];
                }
            });
        }
    };

    const handleImportFileChange = (e) => {
        setImportFile(e.target.files[0]);
    };

    const processImportFile = async () => {
        if (!importFile) return;
        setImportProcessing(true);
        try {
            const text = await importFile.text();
            const lines = text.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                alert('File is empty or has no data rows');
                setImportProcessing(false);
                setShowRoomImportModal(false);
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const paxCodeIndex = headers.findIndex(h => 
                h.includes('pax') || 
                h.includes('code') || 
                h === 'paxcode' || 
                h === 'pax_code'
            );
            
            if (paxCodeIndex === -1) {
                alert('CSV must contain a column for Pax Code (e.g., "Pax Code", "pax_code", "PaxCode")');
                setImportProcessing(false);
                setShowRoomImportModal(false);
                return;
            }
            
            const roomNumberIndex = headers.findIndex(h => 
                h.includes('room') || 
                h.includes('room no') || 
                h.includes('room number') ||
                h === 'roomno' ||
                h === 'room_no'
            );

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = [];
                let current = '';
                let inQuotes = false;
                
                for (let char of line) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());
                
                if (values[paxCodeIndex] && values[paxCodeIndex].trim()) {
                    data.push({
                        paxCode: values[paxCodeIndex].trim(),
                        roomNumber: roomNumberIndex !== -1 ? values[roomNumberIndex]?.trim() || null : null
                    });
                }
            }

            if (data.length === 0) {
                alert('No valid Pax Codes found in the file.');
                setImportProcessing(false);
                setShowRoomImportModal(false);
                return;
            }

            console.log('Import data parsed:', data);
            
            let matchedCount = 0;
            const updates = [];

            const updatePassengerRoom = (passenger, roomNumber) => {
                if (!roomNumber || roomNumber === '') {
                    roomNumber = `R${Math.floor(Math.random() * 900) + 100}`;
                }
                
                if (importContext.tab === 'transit') {
                    return { ...passenger, transitRoomNo: roomNumber };
                } else if (importContext.tab === 'preHotel') {
                    return { ...passenger, preHotelRoomNo: roomNumber };
                } else if (importContext.tab === 'postHotel') {
                    return { ...passenger, postHotelRoomNo: roomNumber };
                } else {
                    return { ...passenger, roomNo: roomNumber };
                }
            };

            if (importContext.tab === 'transit') {
                if (importContext.direction === 'onward' || importContext.direction === '') {
                    setTransitOnwardFlights(prev => {
                        const updated = prev.map(p => {
                            const match = data.find(d => d.paxCode === p.paxCode);
                            if (match) {
                                matchedCount++;
                                updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                                return updatePassengerRoom(p, match.roomNumber);
                            }
                            return p;
                        });
                        return updated;
                    });
                }
                if (importContext.direction === 'return' || importContext.direction === '') {
                    setTransitReturnFlights(prev => {
                        const updated = prev.map(p => {
                            const match = data.find(d => d.paxCode === p.paxCode);
                            if (match) {
                                matchedCount++;
                                updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                                return updatePassengerRoom(p, match.roomNumber);
                            }
                            return p;
                        });
                        return updated;
                    });
                }
            } else if (importContext.tab === 'final') {
                if (importContext.direction === 'onward' || importContext.direction === '') {
                    setFinalOnwardDestinations(prev => {
                        const updated = prev.map(p => {
                            const match = data.find(d => d.paxCode === p.paxCode);
                            if (match) {
                                matchedCount++;
                                updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                                return updatePassengerRoom(p, match.roomNumber);
                            }
                            return p;
                        });
                        return updated;
                    });
                }
                if (importContext.direction === 'return' || importContext.direction === '') {
                    setFinalReturnDestinations(prev => {
                        const updated = prev.map(p => {
                            const match = data.find(d => d.paxCode === p.paxCode);
                            if (match) {
                                matchedCount++;
                                updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                                return updatePassengerRoom(p, match.roomNumber);
                            }
                            return p;
                        });
                        return updated;
                    });
                }
            } else if (importContext.tab === 'preHotel') {
                setPreHotelPassengers(prev => {
                    const updated = prev.map(p => {
                        const match = data.find(d => d.paxCode === p.paxCode);
                        if (match) {
                            matchedCount++;
                            updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                            return updatePassengerRoom(p, match.roomNumber);
                        }
                        return p;
                    });
                    return updated;
                });
            } else if (importContext.tab === 'postHotel') {
                setPostHotelPassengers(prev => {
                    const updated = prev.map(p => {
                        const match = data.find(d => d.paxCode === p.paxCode);
                        if (match) {
                            matchedCount++;
                            updates.push(`${p.paxCode} → ${match.roomNumber || 'R***'}`);
                            return updatePassengerRoom(p, match.roomNumber);
                        }
                        return p;
                    });
                    return updated;
                });
            }

            if (matchedCount > 0) {
                alert(`Import complete! Successfully updated ${matchedCount} passenger(s) with room numbers.\n\nUpdated: ${updates.join(', ')}`);
            } else {
                alert('No matching Pax Codes found in the current data. Please check the Pax Codes in your CSV file.');
            }
            
            setImportProcessing(false);
            setShowRoomImportModal(false);
            setImportFile(null);
            
        } catch (error) {
            console.error('Import error:', error);
            alert('Error processing file: ' + error.message);
            setImportProcessing(false);
        }
    };

    const handleExportRoomNumbers = (tab, direction = '', subTab = '') => {
        let data = [];
        
        if (tab === 'transit') {
            if (direction === 'onward' || direction === '') {
                data = data.concat(transitOnwardFlights.map(p => {
                    const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_transit_onward_stayType`;
                    const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_transit_onward_shareWithM`;
                    const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                    const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                    return {
                        paxCode: p.paxCode || '',
                        fullName: p.fullName || '',
                        roomNo: p.transitRoomNo || p.roomNo || '',
                        hotel: p.transitHotel || p.assignedTransitHotelName || '',
                        checkIn: p.transitDates?.checkIn || p.hotelCheckIn || '',
                        checkOut: p.transitDates?.checkOut || p.hotelCheckOut || '',
                        stayType: stayType,
                        shareWithM: shareWithM,
                        type: 'Transit Onward'
                    };
                }));
            }
            if (direction === 'return' || direction === '') {
                data = data.concat(transitReturnFlights.map(p => {
                    const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_transit_return_stayType`;
                    const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_transit_return_shareWithM`;
                    const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                    const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                    return {
                        paxCode: p.paxCode || '',
                        fullName: p.fullName || '',
                        roomNo: p.transitRoomNo || p.roomNo || '',
                        hotel: p.transitHotel || p.assignedTransitHotelName || '',
                        checkIn: p.transitDates?.checkIn || p.hotelCheckIn || '',
                        checkOut: p.transitDates?.checkOut || p.hotelCheckOut || '',
                        stayType: stayType,
                        shareWithM: shareWithM,
                        type: 'Transit Return'
                    };
                }));
            }
        } else if (tab === 'final') {
            if (direction === 'onward' || direction === '') {
                data = data.concat(finalOnwardDestinations.map(p => {
                    const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_destination_onward_stayType`;
                    const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_destination_onward_shareWithM`;
                    const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                    const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                    return {
                        paxCode: p.paxCode || '',
                        fullName: p.fullName || '',
                        roomNo: p.roomNo || '',
                        hotel: p.hotel || p.assignedHotelName || p.pnrData?.existingHotelName || '',
                        checkIn: p.destinationDates?.checkIn || p.hotelCheckIn || '',
                        checkOut: p.destinationDates?.checkOut || p.hotelCheckOut || '',
                        stayType: stayType,
                        shareWithM: shareWithM,
                        type: 'Final Onward'
                    };
                }));
            }
            if (direction === 'return' || direction === '') {
                data = data.concat(finalReturnDestinations.map(p => {
                    const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_destination_return_stayType`;
                    const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_destination_return_shareWithM`;
                    const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                    const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                    return {
                        paxCode: p.paxCode || '',
                        fullName: p.fullName || '',
                        roomNo: p.roomNo || '',
                        hotel: p.hotel || p.assignedHotelName || '',
                        checkIn: p.destinationDates?.checkIn || p.hotelCheckIn || '',
                        checkOut: p.destinationDates?.checkOut || p.hotelCheckOut || '',
                        stayType: stayType,
                        shareWithM: shareWithM,
                        type: 'Final Return'
                    };
                }));
            }
        } else if (tab === 'preHotel') {
            data = preHotelPassengers.map(p => {
                const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_preHotel_onward_stayType`;
                const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_preHotel_onward_shareWithM`;
                const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                return {
                    paxCode: p.paxCode || '',
                    fullName: p.fullName || '',
                    roomNo: p.preHotelRoomNo || '',
                    hotel: p.preHotel || p.assignedPreHotelName || '',
                    checkIn: p.hotelCheckIn || p.preHotelDates?.checkIn || '',
                    checkOut: p.hotelCheckOut || p.preHotelDates?.checkOut || '',
                    stayType: stayType,
                    shareWithM: shareWithM,
                    type: 'Pre Hotel'
                };
            });
        } else if (tab === 'postHotel') {
            data = postHotelPassengers.map(p => {
                const stayTypeKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_postHotel_onward_stayType`;
                const shareWithMKey = `${p.pnrData?.pnrId}_${p.pnrData?.passengerId}_postHotel_onward_shareWithM`;
                const stayType = passengerStayTypes[stayTypeKey] || p.stayType || selectedStayType || 'hotel';
                const shareWithM = passengerShareWithM[shareWithMKey] || p.shareWithM || selectedShareWithM || 'same';
                return {
                    paxCode: p.paxCode || '',
                    fullName: p.fullName || '',
                    roomNo: p.postHotelRoomNo || '',
                    hotel: p.postHotel || p.assignedPostHotelName || '',
                    checkIn: p.hotelCheckIn || p.postHotelDates?.checkIn || '',
                    checkOut: p.hotelCheckOut || p.postHotelDates?.checkOut || '',
                    stayType: stayType,
                    shareWithM: shareWithM,
                    type: 'Post Hotel'
                };
            });
        }

        data = data.filter(row => row.paxCode || row.fullName);

        if (data.length === 0) {
            alert('No data to export.');
            return;
        }

        const headers = ['Type', 'Pax Code', 'Full Name', 'Room Number', 'Hotel', 'Check-in', 'Check-out', 'Stay Type', 'Share With M'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const escapedFullName = row.fullName.includes(',') ? `"${row.fullName}"` : row.fullName;
            const escapedHotel = row.hotel.includes(',') ? `"${row.hotel}"` : row.hotel;
            
            csvRows.push([
                row.type,
                row.paxCode,
                escapedFullName,
                row.roomNo,
                escapedHotel,
                row.checkIn,
                row.checkOut,
                row.stayType,
                row.shareWithM
            ].join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let filename = `${tab}`;
        if (direction) filename += `_${direction}`;
        if (subTab) filename += `_${subTab}`;
        filename += `_room_numbers_${new Date().toISOString().split('T')[0]}.csv`;
        
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Handle selection in Final Destination tab by direction
    const handleFinalPassengerSelection = (passengerId, flightDirection) => {
        if (flightDirection === 'onward') {
            setSelectedFinalOnwardPassengers(prev => {
                if (prev.includes(passengerId)) {
                    return prev.filter(id => id !== passengerId);
                } else {
                    return [...prev, passengerId];
                }
            });
        } else {
            setSelectedFinalReturnPassengers(prev => {
                if (prev.includes(passengerId)) {
                    return prev.filter(id => id !== passengerId);
                } else {
                    return [...prev, passengerId];
                }
            });
        }
    };

    // Select all in Transit tab by direction
    const handleSelectAllTransitPassengers = (flightDirection) => {
        const currentList = flightDirection === "onward" ? currentTransitOnwardFlights : currentTransitReturnFlights;
        const selectedList = flightDirection === "onward" ? selectedTransitOnwardPassengers : selectedTransitReturnPassengers;
        const setSelectedList = flightDirection === "onward" ? setSelectedTransitOnwardPassengers : setSelectedTransitReturnPassengers;
        
        const allPassengerIds = currentList.map(p => p.id);
        
        if (selectedList.length === allPassengerIds.length) {
            setSelectedList([]);
        } else {
            setSelectedList(allPassengerIds);
        }
    };

    // Select all in Final Destination tab by direction
    const handleSelectAllFinalPassengers = (flightDirection) => {
        const currentList = flightDirection === "onward" ? currentFinalOnwardDestinations : currentFinalReturnDestinations;
        const selectedList = flightDirection === "onward" ? selectedFinalOnwardPassengers : selectedFinalReturnPassengers;
        const setSelectedList = flightDirection === "onward" ? setSelectedFinalOnwardPassengers : setSelectedFinalReturnPassengers;
        
        const allPassengerIds = currentList.map(p => p.id);
        
        if (selectedList.length === allPassengerIds.length) {
            setSelectedList([]);
        } else {
            setSelectedList(allPassengerIds);
        }
    };

    // Handle multi-assign for transit hotels by direction
    const handleMultiAssignTransitHotels = (flightDirection) => {
        const selectedPassengers = flightDirection === "onward" 
            ? selectedTransitOnwardPassengers 
            : selectedTransitReturnPassengers;
        
        const passengerList = flightDirection === "onward" 
            ? transitOnwardFlights 
            : transitReturnFlights;

        if (selectedPassengers.length === 0) {
            setAssignmentError(`Please select at least one passenger to assign ${flightDirection} transit hotel`);
            return;
        }

        if (!multiAssignHotel.hotelId) {
            setAssignmentError("Please select a hotel for multi-assignment");
            return;
        }

        const selectedPassengersData = passengerList.filter(passenger => 
            selectedPassengers.includes(passenger.id)
        );

        const singleSegmentPassengers = selectedPassengersData.filter(passenger => {
            const flightSegments = passenger.pnrData.allSegments || [];
            const directionSegments = flightDirection === "onward" 
                ? flightSegments.filter(s => s.flight_direction === "onward" || !s.flight_direction)
                : flightSegments.filter(s => s.flight_direction === "return");
            const segmentCount = directionSegments.length;
            return segmentCount <= 1;
        });

        if (singleSegmentPassengers.length > 0) {
            const names = singleSegmentPassengers.map(p => p.fullName).join(', ');
            setAssignmentError(`The following passengers have only 1 flight segment for ${flightDirection} journey and cannot be assigned transit hotels: ${names}`);
            return;
        }

        const insufficientGapPassengers = [];
        selectedPassengersData.forEach(passenger => {
            const flightSegments = passenger.pnrData.allSegments || [];
            const directionSegments = flightDirection === "onward" 
                ? flightSegments.filter(s => s.flight_direction === "onward" || !s.flight_direction)
                : flightSegments.filter(s => s.flight_direction === "return");
            const gapInfo = calculateGapBetweenSegments(directionSegments);
            if (gapInfo.gapHours < settings.transitMinHours) {
                insufficientGapPassengers.push({
                    name: passenger.fullName,
                    gap: `${gapInfo.gapHours}h ${gapInfo.gapMinutes}m`
                });
            }
        });

        if (insufficientGapPassengers.length > 0) {
            const names = insufficientGapPassengers.map(p => `${p.name} (${p.gap})`).join(', ');
            setAssignmentError(`The following passengers have insufficient gap for ${flightDirection} transit hotel (minimum ${settings.transitMinHours} hours): ${names}`);
            return;
        }

        if (window.confirm(`Assign selected hotel to ${selectedPassengersData.length} passenger(s) for ${flightDirection} transit?`)) {
            multiAssignHotels(selectedPassengersData, multiAssignHotel, "transit", flightDirection);
        }
    };

    // Handle multi-assign for destination hotels by direction
    const handleMultiAssignDestinationHotels = (flightDirection) => {
        const selectedPassengers = flightDirection === "onward" 
            ? selectedFinalOnwardPassengers 
            : selectedFinalReturnPassengers;
        
        const passengerList = flightDirection === "onward" 
            ? finalOnwardDestinations 
            : finalReturnDestinations;

        if (selectedPassengers.length === 0) {
            setAssignmentError(`Please select at least one passenger to assign ${flightDirection} destination hotel`);
            return;
        }

        if (!multiAssignHotel.hotelId) {
            setAssignmentError("Please select a hotel for multi-assignment");
            return;
        }

        const selectedPassengersData = passengerList.filter(passenger => 
            selectedPassengers.includes(passenger.id)
        );

        if (window.confirm(`Assign selected hotel to ${selectedPassengersData.length} passenger(s) for ${flightDirection} final destination?`)) {
            multiAssignHotels(selectedPassengersData, multiAssignHotel, "destination", flightDirection);
        }
    };

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

    // Multi-assign hotels to multiple passengers
    const multiAssignHotels = async (passengers, hotelData, hotelType, flightDirection = "onward") => {
        try {
            setMultiAssignHotel(prev => ({ ...prev, isAssigning: true }));
            setAssignmentError(null);
            setAssignmentSuccess(null);

            const results = [];
            const errors = [];
            
            for (const passenger of passengers) {
                try {
                    if (!passenger?.pnrData) {
                        errors.push({
                            passenger: passenger.fullName,
                            error: "Missing passenger data"
                        });
                        continue;
                    }

                    const { pnrId, passengerId } = passenger.pnrData;
                    
                    let paxCode = null;
                    if (passenger.pnrData?.passenger?.pax_code) {
                        paxCode = passenger.pnrData.passenger.pax_code;
                    } else if (passenger.pnrData?.passenger?.form_data?.pax_code) {
                        paxCode = passenger.pnrData.passenger.form_data.pax_code;
                    } else if (passenger.pnrData?.passenger?.guest_data?.pax_code) {
                        paxCode = passenger.pnrData.passenger.guest_data.pax_code;
                    }
                    
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

                    let checkInDate, checkOutDate;
                    
                    if (hotelType === 'transit') {
                        const transitDates = calculateTransitHotelDates(passenger.pnrData.allSegments || [], flightDirection);
                        checkInDate = transitDates.checkIn;
                        checkOutDate = transitDates.checkOut;
                    } else if (hotelType === 'preHotel') {
                        const preHotelDates = calculatePreHotelDates(passenger.pnrData.allSegments || []);
                        checkInDate = preHotelDates.checkIn;
                        checkOutDate = preHotelDates.checkOut;
                    } else if (hotelType === 'postHotel') {
                        const postHotelDates = calculatePostHotelDates(passenger.pnrData.allSegments || [], passenger);
                        checkInDate = postHotelDates.checkIn;
                        checkOutDate = postHotelDates.checkOut;
                    } else {
                        const destDates = calculateFinalDestinationDates(passenger.pnrData.allSegments || [], passenger, flightDirection);
                        checkInDate = destDates.checkIn;
                        checkOutDate = destDates.checkOut;
                    }

                    // Get per-passenger stay type
                    const stayTypeKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}_stayType`;
                    const shareWithMKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}_shareWithM`;
                    const currentStayType = passengerStayTypes[stayTypeKey] || passenger.stayType || selectedStayType || 'hotel';
                    const currentShareWithM = passengerShareWithM[shareWithMKey] || passenger.shareWithM || selectedShareWithM || 'same';

                    const assignmentData = {
                        hotelVendorId: hotelData.hotelId,
                        check_in: checkInDate,
                        check_out: checkOutDate,
                        room_type: hotelData.roomType,
                        passenger_index: passenger.pnrData.passengerIndex || 0,
                        remarks: `${hotelType === 'preHotel' ? 'Pre' : hotelType === 'postHotel' ? 'Post' : hotelType === 'transit' ? 'Transit' : 'Destination'} hotel assigned for ${passenger.fullName} (Batch Assignment)`,
                        assigned_by: currentUserId || null,
                        hotel_status: "confirmed",
                        currency: "INR",
                        amount: null,
                        hotel_type: hotelType,
                        flight_direction: flightDirection,
                        room_count: hotelData.roomCount,
                        guest_count: hotelData.guestCount,
                        pax_code: paxCode,
                        is_batch_assignment: true,
                        stay_type: currentStayType,
                        share_with_m: currentShareWithM
                    };

                    console.log(`Assigning ${hotelType} hotel to ${passenger.fullName}:`, assignmentData);

                    const result = await assignHotelToPNR(pnrId, assignmentData);
                    
                    if (result.success) {
                        results.push({
                            passenger: passenger.fullName,
                            paxCode: paxCode,
                            confirmation: result.data?.confirmation?.number,
                            hotel: result.data?.hotel?.vendor_name,
                            success: true,
                            checkIn: checkInDate,
                            checkOut: checkOutDate,
                            hotelType: hotelType,
                            stayType: currentStayType,
                            shareWithM: currentShareWithM
                        });

                        const hotel = availableHotels.find(h => h.id === hotelData.hotelId);
                        const hotelName = hotel?.name || result.data?.hotel?.vendor_name || "Unknown Hotel";
                        
                        const passengerKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}`;
                        setHotelAssignments(prev => ({
                            ...prev,
                            [passengerKey]: hotelData.hotelId
                        }));

                        // Update the appropriate state based on hotel type
                        if (hotelType === 'preHotel') {
                            setPreHotelPassengers(prev => prev.map(p => 
                                p.id === passenger.id ? { ...p, preHotel: hotelName, assignedPreHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                            ));
                        } else if (hotelType === 'postHotel') {
                            setPostHotelPassengers(prev => prev.map(p => 
                                p.id === passenger.id ? { ...p, postHotel: hotelName, assignedPostHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                            ));
                        } else if (hotelType === 'transit') {
                            if (flightDirection === 'onward') {
                                setTransitOnwardFlights(prev => prev.map(p => 
                                    p.id === passenger.id ? { ...p, transitHotel: hotelName, assignedTransitHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                                ));
                            } else {
                                setTransitReturnFlights(prev => prev.map(p => 
                                    p.id === passenger.id ? { ...p, transitHotel: hotelName, assignedTransitHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                                ));
                            }
                        } else {
                            if (flightDirection === 'onward') {
                                setFinalOnwardDestinations(prev => prev.map(p => 
                                    p.id === passenger.id ? { ...p, hotel: hotelName, assignedHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                                ));
                            } else {
                                setFinalReturnDestinations(prev => prev.map(p => 
                                    p.id === passenger.id ? { ...p, hotel: hotelName, assignedHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                                ));
                            }
                        }
                    } else {
                        errors.push({
                            passenger: passenger.fullName,
                            error: result.message || "Failed to assign hotel"
                        });
                    }
                } catch (error) {
                    errors.push({
                        passenger: passenger.fullName,
                        error: error.message
                    });
                }
            }

            if (results.length > 0) {
                const successMessage = `Successfully assigned ${hotelType === 'preHotel' ? 'Pre' : hotelType === 'postHotel' ? 'Post' : hotelType === 'transit' ? 'Transit' : 'Destination'} hotel to ${results.length} passenger(s)`;
                setAssignmentSuccess({
                    message: successMessage,
                    details: results,
                    totalAssigned: results.length,
                    totalErrors: errors.length,
                    hotelType: hotelType
                });

                setTimeout(() => {
                    fetchPnrPassengers();
                }, 1000);
            }

            if (errors.length > 0) {
                const errorMessage = `Failed to assign hotel to ${errors.length} passenger(s)`;
                setAssignmentError({
                    message: errorMessage,
                    details: errors
                });
            }

            // Clear selections based on hotel type
            if (hotelType === 'preHotel') {
                setSelectedPreHotelPassengers([]);
            } else if (hotelType === 'postHotel') {
                setSelectedPostHotelPassengers([]);
            } else if (hotelType === 'transit') {
                if (flightDirection === 'onward') {
                    setSelectedTransitOnwardPassengers([]);
                } else {
                    setSelectedTransitReturnPassengers([]);
                }
            } else {
                if (flightDirection === 'onward') {
                    setSelectedFinalOnwardPassengers([]);
                } else {
                    setSelectedFinalReturnPassengers([]);
                }
            }

        } catch (error) {
            console.error('Multi-assign error:', error);
            setAssignmentError({
                message: "Batch assignment failed",
                details: [{ error: error.message }]
            });
        } finally {
            setMultiAssignHotel(prev => ({ ...prev, isAssigning: false }));
        }
    };

    // Fetch PNR passengers by lead ID
    const fetchPnrPassengers = async () => {
        try {
            setPnrLoading(true);
            setPnrError("");
            console.log(`Fetching PNR passengers for lead ID: ${id}`);
            const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/hotels/done-passengers/lead/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch PNR passengers');
            }

            console.log("Raw PNR data received:", data);
            
            const normalizedData = (data.data || []).map(pnr => ({
                ...pnr,
                flight_segments: (pnr.flight_segments || []).map(extractFlightSegmentData),
                passengers: (pnr.passengers || []).map((passenger, idx) => {
                    console.log("Individual passenger data:", passenger);
                    console.log("Passenger form_data:", passenger.form_data);
                    console.log("Passenger guest_data:", passenger.guest_data);
                    
                    return {
                        ...passenger,
                        form_data: passenger.form_data || {},
                        first_name: passenger.first_name || passenger.form_data?.first_name || "",
                        last_name: passenger.last_name || passenger.form_data?.last_name || "",
                        passenger_id: passenger.passenger_id || passenger.id,
                        guest_data: passenger.guest_data || {},
                        passengerIndex: idx,
                        stayType: passenger.stay_type || passenger.stayType || 'hotel',
                        shareWithM: passenger.share_with_m || passenger.shareWithM || 'same',
                        lead_id: passenger.lead_id || null
                    }
                })
            }));

            console.log("Normalized PNR data:", normalizedData);
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

    const handleAssignHotel = async (passengerData, hotelId, hotelType = "destination", flightDirection = "onward", customDates = null) => {
        if (!passengerData?.pnrData) {
            setAssignmentError("Missing passenger data");
            return;
        }

        try {
            setAssigningHotel(passengerData.id);
            setAssignmentError(null);
            setAssignmentSuccess(null);

            const { pnrId, passengerId, hasExistingHotel, existingHotelVendorId, existingHotelName, allSegments } = passengerData.pnrData;
            
            let paxCode = null;
            
            if (passengerData.pnrData?.passenger?.pax_code) {
                paxCode = passengerData.pnrData.passenger.pax_code;
            } else if (passengerData.pnrData?.passenger?.form_data?.pax_code) {
                paxCode = passengerData.pnrData.passenger.form_data.pax_code;
            } else if (passengerData.pnrData?.passenger?.guest_data?.pax_code) {
                paxCode = passengerData.pnrData.passenger.guest_data.pax_code;
            } else {
                paxCode = passengerData.pnrData.passenger?.form_data?.pax_code || null;
            }
            
            console.log('Extracted pax_code:', paxCode, 'from passenger:', passengerData.pnrData.passenger);
            
            if (hotelType === 'preHotel') {
                const flightSegments = allSegments || [];
                if (flightSegments.length === 0) {
                    setAssignmentError(`No flight segments found for pre-hotel assignment`);
                    setAssigningHotel(null);
                    return;
                }
            }

            if (hotelType === 'postHotel') {
                const flightSegments = allSegments || [];
                if (flightSegments.length === 0) {
                    setAssignmentError(`No flight segments found for post-hotel assignment`);
                    setAssigningHotel(null);
                    return;
                }
            }
            
            if (!hotelId) {
                setAssignmentError("Please select a hotel");
                setAssigningHotel(null);
                return;
            }

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
            
            let passengerIndex = passengerData.pnrData.passengerIndex || 0;
            if (passengerData.pnrData.passengers && Array.isArray(passengerData.pnrData.passengers)) {
                const foundIndex = passengerData.pnrData.passengers.findIndex(p => 
                    p.passenger_id === passengerId || p.id === passengerId
                );
                if (foundIndex !== -1) {
                    passengerIndex = foundIndex;
                }
            }

            let checkInDate, checkOutDate;
            
            if (customDates) {
                checkInDate = customDates.checkIn;
                checkOutDate = customDates.checkOut;
            } else if (hotelType === 'preHotel') {
                const preHotelDates = calculatePreHotelDates(allSegments || []);
                checkInDate = preHotelDates.checkIn;
                checkOutDate = preHotelDates.checkOut;
            } else if (hotelType === 'postHotel') {
                const postHotelDates = calculatePostHotelDates(allSegments || [], passengerData);
                checkInDate = postHotelDates.checkIn;
                checkOutDate = postHotelDates.checkOut;
            } else if (hotelType === 'transit') {
                const transitDates = calculateTransitHotelDates(allSegments || [], flightDirection);
                if (transitDates.error || !transitDates.hasGap) {
                    setAssignmentError(transitDates.message || transitDates.error || `Cannot calculate transit dates for ${flightDirection} journey`);
                    setAssigningHotel(null);
                    return;
                }
                checkInDate = transitDates.checkIn;
                checkOutDate = transitDates.checkOut;
            } else {
                const destDates = calculateFinalDestinationDates(allSegments || [], passengerData, flightDirection);
                checkInDate = destDates.checkIn;
                checkOutDate = destDates.checkOut;
            }
            
            if (!checkInDate || !checkOutDate) {
                setAssignmentError(`Could not calculate check-in/check-out dates`);
                setAssigningHotel(null);
                return;
            }

            const selectedHotel = availableHotels.find(h => h.id === hotelId);
            const hotelName = selectedHotel?.name || "Unknown Hotel";

            // Get per-passenger stay type
            const stayTypeKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}_stayType`;
            const shareWithMKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}_shareWithM`;
            const currentStayType = passengerStayTypes[stayTypeKey] || passengerData.stayType || selectedStayType || 'hotel';
            const currentShareWithM = passengerShareWithM[shareWithMKey] || passengerData.shareWithM || selectedShareWithM || 'same';

            const hotelData = {
                hotelVendorId: hotelId,
                check_in: checkInDate,
                check_out: checkOutDate,
                room_type: hotelType === 'transit' ? "Transit Standard" : "Standard",
                passenger_index: passengerIndex,
                remarks: `${hotelType === 'preHotel' ? 'Pre' : hotelType === 'postHotel' ? 'Post' : hotelType === 'transit' ? 'Transit' : 'Destination'} hotel assigned to "${hotelName}" for ${passengerData.fullName}`,
                assigned_by: currentUserId || null,
                hotel_status: "confirmed",
                currency: "INR",
                amount: null,
                hotel_type: hotelType,
                flight_direction: flightDirection,
                room_count: 1,
                guest_count: 1,
                pax_code: paxCode,
                stay_type: currentStayType,
                share_with_m: currentShareWithM
            };

            console.log('Assigning hotel with pax_code:', { 
                pnrId, 
                passengerId, 
                paxCode,
                hotelId, 
                hotelName,
                hotelType,
                flightDirection,
                checkInDate,
                checkOutDate,
                hotelData 
            });

            const result = await assignHotelToPNR(pnrId, hotelData);
            
            if (result.success) {
                const action = "assigned";
                const successMessage = `${hotelType === 'preHotel' ? 'Pre' : hotelType === 'postHotel' ? 'Post' : hotelType === 'transit' ? 'Transit' : 'Destination'} hotel ${action} successfully for ${passengerData.fullName}`;
                const confirmationNumber = result.data?.confirmation?.number;
                
                setAssignmentSuccess({
                    message: successMessage,
                    confirmation: confirmationNumber,
                    hotel: hotelName,
                    passengerName: passengerData.fullName,
                    action: action,
                    hotelType: hotelType,
                    paxCode: paxCode,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    stayType: currentStayType,
                    shareWithM: currentShareWithM
                });

                const passengerKey = `${pnrId}_${passengerId}_${hotelType}_${flightDirection}`;
                setHotelAssignments(prev => ({
                    ...prev,
                    [passengerKey]: hotelId
                }));

                // Update the appropriate state based on hotel type
                if (hotelType === 'preHotel') {
                    setPreHotelPassengers(prev => prev.map(p => 
                        p.id === passengerData.id ? { ...p, preHotel: hotelName, assignedPreHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                    ));
                } else if (hotelType === 'postHotel') {
                    setPostHotelPassengers(prev => prev.map(p => 
                        p.id === passengerData.id ? { ...p, postHotel: hotelName, assignedPostHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                    ));
                } else if (hotelType === 'transit') {
                    if (flightDirection === 'onward') {
                        setTransitOnwardFlights(prev => prev.map(p => 
                            p.id === passengerData.id ? { ...p, transitHotel: hotelName, assignedTransitHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                        ));
                    } else {
                        setTransitReturnFlights(prev => prev.map(p => 
                            p.id === passengerData.id ? { ...p, transitHotel: hotelName, assignedTransitHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                        ));
                    }
                } else {
                    if (flightDirection === 'onward') {
                        setFinalOnwardDestinations(prev => prev.map(p => 
                            p.id === passengerData.id ? { ...p, hotel: hotelName, assignedHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                        ));
                    } else {
                        setFinalReturnDestinations(prev => prev.map(p => 
                            p.id === passengerData.id ? { ...p, hotel: hotelName, assignedHotelName: hotelName, stayType: currentStayType, shareWithM: currentShareWithM } : p
                        ));
                    }
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
                errorMessage = "This passenger already has a hotel assigned. Please cancel the existing assignment first.";
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

    // Handle multi-assign for Pre Hotel (UNIFIED)
    const handleMultiAssignPreHotels = () => {
        if (selectedPreHotelPassengers.length === 0) {
            setAssignmentError("Please select at least one passenger to assign pre-hotel");
            return;
        }

        if (!multiAssignHotel.hotelId) {
            setAssignmentError("Please select a hotel for multi-assignment");
            return;
        }

        const selectedPassengersData = preHotelPassengers.filter(passenger => 
            selectedPreHotelPassengers.includes(passenger.id)
        );

        if (window.confirm(`Assign selected pre-hotel to ${selectedPassengersData.length} passenger(s)?`)) {
            multiAssignHotels(selectedPassengersData, multiAssignHotel, "preHotel", "onward");
        }
    };

    // Handle multi-assign for Post Hotel (UNIFIED)
    const handleMultiAssignPostHotels = () => {
        if (selectedPostHotelPassengers.length === 0) {
            setAssignmentError("Please select at least one passenger to assign post-hotel");
            return;
        }

        if (!multiAssignHotel.hotelId) {
            setAssignmentError("Please select a hotel for multi-assignment");
            return;
        }

        const selectedPassengersData = postHotelPassengers.filter(passenger => 
            selectedPostHotelPassengers.includes(passenger.id)
        );

        if (window.confirm(`Assign selected post-hotel to ${selectedPassengersData.length} passenger(s)?`)) {
            multiAssignHotels(selectedPassengersData, multiAssignHotel, "postHotel", "onward");
        }
    };

    // Handle selection in Pre Hotel (UNIFIED)
    const handlePreHotelPassengerSelection = (passengerId) => {
        setSelectedPreHotelPassengers(prev => {
            if (prev.includes(passengerId)) {
                return prev.filter(id => id !== passengerId);
            } else {
                return [...prev, passengerId];
            }
        });
    };

    // Handle selection in Post Hotel (UNIFIED)
    const handlePostHotelPassengerSelection = (passengerId) => {
        setSelectedPostHotelPassengers(prev => {
            if (prev.includes(passengerId)) {
                return prev.filter(id => id !== passengerId);
            } else {
                return [...prev, passengerId];
            }
        });
    };

    // Select all in Pre Hotel (UNIFIED)
    const handleSelectAllPreHotelPassengers = () => {
        const allPassengerIds = currentPreHotelPassengers.map(p => p.id);
        
        if (selectedPreHotelPassengers.length === allPassengerIds.length) {
            setSelectedPreHotelPassengers([]);
        } else {
            setSelectedPreHotelPassengers(allPassengerIds);
        }
    };

    // Select all in Post Hotel (UNIFIED)
    const handleSelectAllPostHotelPassengers = () => {
        const allPassengerIds = currentPostHotelPassengers.map(p => p.id);
        
        if (selectedPostHotelPassengers.length === allPassengerIds.length) {
            setSelectedPostHotelPassengers([]);
        } else {
            setSelectedPostHotelPassengers(allPassengerIds);
        }
    };

    const clearAssignmentMessages = () => {
        setAssignmentError(null);
        setAssignmentSuccess(null);
    };

    // ==================== HELPER FUNCTIONS ====================

    const getGuestType = (passenger) => {
        console.log("=== getGuestType called ===");
        console.log("Passenger object:", passenger);
        
        if (!passenger) {
            console.log("No passenger object, returning 'General'");
            return "General";
        }
        
        const formData = passenger.form_data || {};
        const guestData = passenger.guest_data || {};
        
        console.log("Form data:", formData);
        console.log("Guest data:", guestData);
        
        const mealType = formData["meal_type_(only_for_hotel)"] || formData.meal_type;
        console.log("Meal type found:", mealType);
        
        const dateOfBirth = formData.date_of_birth || passenger.date_of_birth;
        console.log("Date of birth for age calculation:", dateOfBirth);
        
        const ageInfo = calculateGuestTypeFromDOB(dateOfBirth);
        console.log("Age info calculated:", ageInfo);
        
        let ageCategory = "";
        if (ageInfo.age !== null) {
            if (ageInfo.age < 4) {
                ageCategory = "Baby";
            } else if (ageInfo.age < 11) {
                ageCategory = "Child";
            } else if (ageInfo.age < 18) {
                ageCategory = "Young";
            } else {
                ageCategory = "Adult";
            }
        }
        
        const travelPurpose = formData.travel_purpose || guestData.travel_purpose;
        console.log("Travel purpose found:", travelPurpose);
        
        let guestType = "";
        
        if (mealType && mealType !== "N/A" && mealType !== "Not Specified" && mealType.trim() !== "") {
            guestType += `Hotel: ${mealType}`;
        }
        
        if (travelPurpose && travelPurpose !== "N/A" && travelPurpose !== "Not Specified" && travelPurpose.trim() !== "") {
            if (guestType) guestType += ", ";
            guestType += travelPurpose;
        }
        
        if (ageCategory) {
            if (guestType) guestType += ", ";
            guestType += ageCategory;
        }
        
        if (!guestType) {
            if (ageCategory) {
                guestType = ageCategory;
            } else {
                const hasBusinessInfo = formData.official_email_id || 
                                       formData.emp_id || 
                                       formData.company_name ||
                                       (guestData.data && guestData.data.business_traveler === true);
                guestType = hasBusinessInfo ? "Business" : "General";
            }
        }
        
        console.log("Final guest type determined:", guestType);
        return guestType;
    };

    const calculateGuestTypeFromDOB = (dateOfBirth) => {
        console.log("=== calculateGuestTypeFromDOB called ===");
        console.log("Input dateOfBirth:", dateOfBirth);
        
        if (!dateOfBirth || dateOfBirth === "N/A" || dateOfBirth === "Not Specified" || dateOfBirth.trim() === "") {
            console.log("No valid DOB provided");
            return { age: null, ageCategory: "Unknown" };
        }
        
        try {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            
            if (isNaN(dob.getTime())) {
                console.log("Invalid date format");
                return { age: null, ageCategory: "Unknown" };
            }
            
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            console.log("Calculated age:", age, "from DOB:", dateOfBirth);
            
            let ageCategory;
            if (age < 4) {
                ageCategory = "Baby";
            } else if (age < 11) {
                ageCategory = "Child";
            } else if (age < 18) {
                ageCategory = "Young";
            } else {
                ageCategory = "Adult";
            }
            
            console.log("Age category determined:", ageCategory);
            
            return { 
                age, 
                ageCategory: ageCategory,
                originalDOB: dateOfBirth
            };
        } catch (error) {
            console.error("Error calculating age from DOB:", error, "DOB:", dateOfBirth);
            return { age: null, ageCategory: "Unknown" };
        }
    };

    const calculateGapBetweenSegments = (segments) => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        
        if (!flightSegments || flightSegments.length < 2) {
            return { 
                gap: "N/A", 
                details: "Single segment or no segments",
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false
            };
        }
        
        const sortedSegments = [...flightSegments].sort((a, b) => a.segment_order - b.segment_order);
        
        const firstSegment = sortedSegments[0];
        const secondSegment = sortedSegments[1];
        
        if (!firstSegment.arrival_date || !firstSegment.arrival_time || 
            !secondSegment.departure_date || !secondSegment.departure_time) {
            return { 
                gap: "N/A", 
                details: "Missing arrival/departure times",
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false
            };
        }
        
        try {
            const arrivalDateTimeStr = `${firstSegment.arrival_date}T${firstSegment.arrival_time}:00`;
            const departureDateTimeStr = `${secondSegment.departure_date}T${secondSegment.departure_time}:00`;
            
            const arrivalDateTime = new Date(arrivalDateTimeStr);
            const departureDateTime = new Date(departureDateTimeStr);
            
            if (isNaN(arrivalDateTime.getTime()) || isNaN(departureDateTime.getTime())) {
                return { 
                    gap: "N/A", 
                    details: "Invalid date format",
                    gapHours: 0,
                    gapMinutes: 0,
                    hasGap: false
                };
            }
            
            const gapMs = departureDateTime - arrivalDateTime;
            
            if (gapMs < 0) {
                return { 
                    gap: "N/A", 
                    details: "Departure before arrival",
                    gapHours: 0,
                    gapMinutes: 0,
                    hasGap: false
                };
            }
            
            const gapHours = Math.floor(gapMs / (1000 * 60 * 60));
            const gapMinutes = Math.floor((gapMs % (1000 * 60 * 60)) / (1000 * 60));
            
            let gapDisplay = "";
            if (gapHours > 0) {
                gapDisplay += `${gapHours}h `;
            }
            if (gapMinutes > 0 || gapHours === 0) {
                gapDisplay += `${gapMinutes}m`;
            }
            
            return {
                gap: gapDisplay.trim() || "0m",
                details: `Between ${firstSegment.to_airport || firstSegment.arrival_airport || "N/A"} and ${secondSegment.from_airport || secondSegment.departure_airport || "N/A"}`,
                gapHours,
                gapMinutes,
                hasGap: gapMs >= settings.transitMinHours * 60 * 60 * 1000,
                arrivalDateTime: arrivalDateTimeStr,
                departureDateTime: departureDateTimeStr,
                fromAirport: firstSegment.to_airport || firstSegment.arrival_airport || "N/A",
                toAirport: secondSegment.from_airport || secondSegment.departure_airport || "N/A"
            };
        } catch (error) {
            console.error("Error calculating gap between segments:", error);
            return { 
                gap: "N/A", 
                details: `Error: ${error.message}`,
                gapHours: 0,
                gapMinutes: 0,
                hasGap: false
            };
        }
    };

    const calculateTotalTravelDuration = (segments) => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        
        if (!flightSegments || flightSegments.length === 0) {
            return "N/A";
        }
        
        const sortedSegments = [...flightSegments].sort((a, b) => a.segment_order - b.segment_order);
        const firstSegment = sortedSegments[0];
        const lastSegment = sortedSegments[sortedSegments.length - 1];
        
        if (!firstSegment.departure_date || !firstSegment.departure_time || 
            !lastSegment.arrival_date || !lastSegment.arrival_time) {
            return "N/A";
        }
        
        try {
            const startDateTime = new Date(`${firstSegment.departure_date}T${firstSegment.departure_time}:00`);
            const endDateTime = new Date(`${lastSegment.arrival_date}T${lastSegment.arrival_time}:00`);
            
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                return "N/A";
            }
            
            const totalMs = endDateTime - startDateTime;
            if (totalMs < 0) return "N/A";
            
            const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
            const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
            
            let display = "";
            if (totalHours > 0) {
                display += `${totalHours}h `;
            }
            if (totalMinutes > 0 || totalHours === 0) {
                display += `${totalMinutes}m`;
            }
            
            return display.trim() || "0m";
        } catch (error) {
            console.error("Error calculating total duration:", error);
            return "N/A";
        }
    };

    const getFlightLocations = (flightSegments, passengerData, flightDirection = "onward") => {
        const segments = flightSegments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        
        const directionSegments = flightDirection === "onward" 
            ? segments.filter(s => s.flight_direction === "onward" || !s.flight_direction)
            : segments.filter(s => s.flight_direction === "return");
        
        if (!directionSegments || directionSegments.length === 0) {
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
        
        const sortedSegments = [...directionSegments].sort((a, b) => a.segment_order - b.segment_order);
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
            flight_direction: segment.flight_direction || "onward",
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

    // ==================== PROCESSING FUNCTIONS ====================

    const processPnrPassengers = () => {
        console.log("=== processPnrPassengers called ===");
        const transitOnwardList = [];
        const transitReturnList = [];
        const finalOnwardList = [];
        const finalReturnList = [];
        const preHotelList = [];
        const postHotelList = [];
        
        let transitOnwardIndex = 1;
        let transitReturnIndex = 1;
        let finalOnwardIndex = 1;
        let finalReturnIndex = 1;
        let preHotelIndex = 1;
        let postHotelIndex = 1;

        const existingTransitOnwardPassengers = new Map();
        const existingTransitReturnPassengers = new Map();
        const existingFinalOnwardPassengers = new Map();
        const existingFinalReturnPassengers = new Map();
        const existingPreHotelPassengers = new Map();
        const existingPostHotelPassengers = new Map();
        
        transitOnwardFlights.forEach(th => existingTransitOnwardPassengers.set(th.id, th));
        transitReturnFlights.forEach(th => existingTransitReturnPassengers.set(th.id, th));
        finalOnwardDestinations.forEach(fd => existingFinalOnwardPassengers.set(fd.id, fd));
        finalReturnDestinations.forEach(fd => existingFinalReturnPassengers.set(fd.id, fd));
        preHotelPassengers.forEach(ph => existingPreHotelPassengers.set(ph.id, ph));
        postHotelPassengers.forEach(ph => existingPostHotelPassengers.set(ph.id, ph));

        pnrPassengers.forEach((pnr, pnrIndex) => {
            console.log(`Processing PNR ${pnrIndex + 1}/${pnrPassengers.length}: ${pnr.pnr_number || 'No PNR number'}`);
            if (pnr.passengers && Array.isArray(pnr.passengers)) {
                pnr.passengers.forEach((passenger, passengerIndex) => {
                    console.log(`Processing passenger ${passengerIndex + 1}/${pnr.passengers.length}`);
                    console.log("Passenger data:", passenger);
                    
                    const flightSegments = pnr.flight_segments || [];
                    const actualFlightSegments = flightSegments.filter(segment => 
                        !segment.type || segment.type !== "hotel"
                    );
                    
                    const onwardSegments = actualFlightSegments.filter(s => s.flight_direction === "onward" || !s.flight_direction);
                    const returnSegments = actualFlightSegments.filter(s => s.flight_direction === "return");
                    
                    const onwardSortedSegments = [...onwardSegments].sort((a, b) => a.segment_order - b.segment_order);
                    const returnSortedSegments = [...returnSegments].sort((a, b) => a.segment_order - b.segment_order);
                    
                    const onwardSegmentCount = onwardSortedSegments.length;
                    const returnSegmentCount = returnSortedSegments.length;
                    
                    console.log("Onward segment count:", onwardSegmentCount);
                    console.log("Return segment count:", returnSegmentCount);
                    
                    const paxCode = passenger.pax_code || passenger.form_data?.pax_code || passenger.guest_data?.pax_code || null;
                    console.log("Passenger pax_code:", paxCode);
                    
                    const hasDestinationHotel = pnr.hotel_vendor_id && pnr.hotel_vendor_name;
                    const hasTransitHotel = pnr.transit_hotel_name;
                    
                    const destinationHotelVendorId = pnr.hotel_vendor_id;
                    const destinationHotelName = pnr.hotel_vendor_name;
                    const transitHotelName = pnr.transit_hotel_name;
                    
                    const passengerKey = `${pnr.id}_${passenger.passenger_id}`;
                    
                    const gapInfoOnward = calculateGapBetweenSegments(onwardSegments);
                    const gapInfoReturn = calculateGapBetweenSegments(returnSegments);
                    
                    const totalTravelDurationOnward = calculateTotalTravelDuration(onwardSegments);
                    const totalTravelDurationReturn = calculateTotalTravelDuration(returnSegments);
                    
                    const transitDatesOnward = calculateTransitHotelDates(flightSegments, "onward");
                    const transitDatesReturn = calculateTransitHotelDates(flightSegments, "return");
                    const destinationDatesOnward = calculateFinalDestinationDates(flightSegments, passenger, "onward");
                    const destinationDatesReturn = calculateFinalDestinationDates(flightSegments, passenger, "return");
                    
                    // Calculate Pre Hotel and Post Hotel dates (UNIFIED)
                    const preHotelDates = calculatePreHotelDates(flightSegments);
                    const postHotelDates = calculatePostHotelDates(flightSegments, passenger);
                    
                    let nextFlightOnward = null;
                    if (onwardSortedSegments.length > 1) {
                        nextFlightOnward = onwardSortedSegments[1];
                    }
                    
                    let nextFlightReturn = null;
                    if (returnSortedSegments.length > 1) {
                        nextFlightReturn = returnSortedSegments[1];
                    }
                    
                    const flightLocationsOnward = getFlightLocations(flightSegments, passenger, "onward");
                    const flightLocationsReturn = getFlightLocations(flightSegments, passenger, "return");
                    
                    // Get assigned hotels
                    const assignedTransitOnwardHotelId = hotelAssignments[`${passengerKey}_transit_onward`];
                    const assignedTransitReturnHotelId = hotelAssignments[`${passengerKey}_transit_return`];
                    const assignedDestinationOnwardHotelId = hotelAssignments[`${passengerKey}_destination_onward`] || (hasDestinationHotel ? destinationHotelVendorId : null);
                    const assignedDestinationReturnHotelId = hotelAssignments[`${passengerKey}_destination_return`];
                    
                    // UNIFIED Pre Hotel and Post Hotel assignments
                    const assignedPreHotelHotelId = hotelAssignments[`${passengerKey}_preHotel_onward`];
                    const assignedPostHotelHotelId = hotelAssignments[`${passengerKey}_postHotel_onward`];
                    
                    const assignedTransitOnwardHotel = availableHotels.find(h => h.id === assignedTransitOnwardHotelId);
                    const assignedTransitReturnHotel = availableHotels.find(h => h.id === assignedTransitReturnHotelId);
                    const assignedDestinationOnwardHotel = availableHotels.find(h => h.id === assignedDestinationOnwardHotelId);
                    const assignedDestinationReturnHotel = availableHotels.find(h => h.id === assignedDestinationReturnHotelId);
                    
                    // UNIFIED Pre Hotel and Post Hotel hotels
                    const assignedPreHotel = availableHotels.find(h => h.id === assignedPreHotelHotelId);
                    const assignedPostHotel = availableHotels.find(h => h.id === assignedPostHotelHotelId);
                    
                    const dateOfBirth = passenger.form_data?.date_of_birth || passenger.date_of_birth;
                    console.log("Passenger date of birth:", dateOfBirth);
                    
                    const ageInfo = calculateGuestTypeFromDOB(dateOfBirth);
                    console.log("Age info for passenger:", ageInfo);
                    
                    const guestType = getGuestType(passenger);
                    console.log(`Guest type for ${passenger.first_name || passenger.passenger_id}: ${guestType}`);
                    
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

                    // Get passenger's stay type and share with M
                    const passengerStayType = passenger.stay_type || passenger.stayType || 'hotel';
                    const passengerShareWithM = passenger.share_with_m || passenger.shareWithM || 'same';

                    // Create base passenger data object
                    const basePassengerData = {
                        id: passengerKey,
                        rowKey: `${pnrPassengers.indexOf(pnr)}_${pnr.passengers.indexOf(passenger)}`,
                        srNo: 0,
                        title: passenger.form_data?.title || passenger.title || "Mr.",
                        fullName: `${passenger.form_data?.first_name || passenger.first_name || ''} ${passenger.form_data?.last_name || passenger.last_name || ''}`.trim() || "Unknown Passenger",
                        guestType: guestType,
                        age: ageInfo.age,
                        dateOfBirth: dateOfBirth,
                        ageCategory: ageInfo.ageCategory,
                        paxCode: paxCode,
                        remarks: '',
                        stayType: passengerStayType,
                        shareWithM: passengerShareWithM,
                        lead_id: passenger.lead_id || null,
                        pnrData: {
                            pnrId: pnr.id,
                            passengerId: passenger.passenger_id,
                            pnr_number: pnr.pnr_number,
                            passenger: passenger,
                            passengers: pnr.passengers,
                            passengerIndex: passengerIndex,
                            flight_segments: actualFlightSegments,
                            allSegments: flightSegments,
                            hasExistingHotel: hasDestinationHotel,
                            existingHotelVendorId: destinationHotelVendorId,
                            existingHotelName: destinationHotelName,
                            hotelCheckIn: pnr.hotel_check_in,
                            hotelCheckOut: pnr.hotel_check_out,
                            hotelConfirmationNumber: pnr.hotel_confirmation_number,
                            hotelStatus: pnr.hotel_status,
                            hasTransitHotel: hasTransitHotel,
                            transitHotelName: transitHotelName,
                            transitHotelCheckIn: pnr.transit_hotel_check_in,
                            transitHotelCheckOut: pnr.transit_hotel_check_out,
                            transitHotelRoomCount: pnr.transit_hotel_room_count,
                            transitHotelGuestCount: pnr.transit_hotel_guest_count,
                            lead_id: passenger.lead_id || null
                        }
                    };

                    // Create UNIQUE ID for Pre Hotel and Post Hotel (without direction)
                    const preHotelUniqueId = `${passengerKey}_preHotel`;
                    const postHotelUniqueId = `${passengerKey}_postHotel`;

                    // Add PRE HOTEL (UNIFIED - no direction)
                    const preHotelData = {
                        ...basePassengerData,
                        id: preHotelUniqueId,
                        srNo: preHotelIndex,
                        category: "Pre Hotel",
                        hotelType: "Pre Hotel",
                        hotelCheckIn: preHotelDates.checkIn,
                        hotelCheckOut: preHotelDates.checkOut,
                        preHotelRoomNo: passenger.pre_hotel_room_no || passenger.preHotelRoomNo || 
                                        (assignedPreHotel ? `PR${Math.floor(Math.random() * 900) + 100}` : ""),
                        preHotelRoomType: assignedPreHotel ? "Standard" : "",
                        depFlightDate: getSegmentDate(onwardSortedSegments[0] || returnSortedSegments[0] || {}, 'departure'),
                        depFlightDepTime: getSegmentTime(onwardSortedSegments[0] || returnSortedSegments[0] || {}, 'departure'),
                        depFlightAirport: onwardSortedSegments[0]?.from_airport || returnSortedSegments[0]?.from_airport || "N/A",
                        hotel: assignedPreHotel ? assignedPreHotel.name : "",
                        assignedPreHotelName: assignedPreHotel ? assignedPreHotel.name : null,
                        preHotelDates: preHotelDates,
                        stayType: passengerStayType,
                        shareWithM: passengerShareWithM,
                        lead_id: passenger.lead_id || null
                    };

                    if (existingPreHotelPassengers.has(preHotelData.id)) {
                        const existing = existingPreHotelPassengers.get(preHotelData.id);
                        preHotelData.srNo = existing.srNo || preHotelIndex++;
                        preHotelList.push(preHotelData);
                    } else {
                        preHotelData.srNo = preHotelIndex++;
                        preHotelList.push(preHotelData);
                    }

                    // Add POST HOTEL (UNIFIED - no direction)
                    const postHotelData = {
                        ...basePassengerData,
                        id: postHotelUniqueId,
                        srNo: postHotelIndex,
                        category: "Post Hotel",
                        hotelType: "Post Hotel",
                        hotelCheckIn: postHotelDates.checkIn,
                        hotelCheckOut: postHotelDates.checkOut,
                        postHotelRoomNo: passenger.post_hotel_room_no || passenger.postHotelRoomNo || 
                                         (assignedPostHotel ? `PO${Math.floor(Math.random() * 900) + 100}` : ""),
                        postHotelRoomType: assignedPostHotel ? "Standard" : "",
                        arvFlightDate: getSegmentDate(onwardSortedSegments[onwardSortedSegments.length - 1] || returnSortedSegments[returnSortedSegments.length - 1] || {}, 'arrival'),
                        arvFlightArvTime: getSegmentTime(onwardSortedSegments[onwardSortedSegments.length - 1] || returnSortedSegments[returnSortedSegments.length - 1] || {}, 'arrival'),
                        arvFlightAirport: onwardSortedSegments[onwardSortedSegments.length - 1]?.to_airport || returnSortedSegments[returnSortedSegments.length - 1]?.to_airport || "N/A",
                        hotel: assignedPostHotel ? assignedPostHotel.name : "",
                        assignedPostHotelName: assignedPostHotel ? assignedPostHotel.name : null,
                        postHotelDates: postHotelDates,
                        stayType: passengerStayType,
                        shareWithM: passengerShareWithM,
                        lead_id: passenger.lead_id || null
                    };

                    if (existingPostHotelPassengers.has(postHotelData.id)) {
                        const existing = existingPostHotelPassengers.get(postHotelData.id);
                        postHotelData.srNo = existing.srNo || postHotelIndex++;
                        postHotelList.push(postHotelData);
                    } else {
                        postHotelData.srNo = postHotelIndex++;
                        postHotelList.push(postHotelData);
                    }

                    // Process ONWARD journey data
                    const onwardPassengerData = {
                        ...basePassengerData,
                        id: `${passengerKey}_onward`,
                        srNo: finalOnwardIndex,
                        category: "Final Destination (Onward)",
                        hotelType: "Destination Hotel (Onward)",
                        departureLocation: flightLocationsOnward.departure,
                        arrivalLocation: flightLocationsOnward.arrival,
                        departureLocationFull: flightLocationsOnward.departureFull,
                        arrivalLocationFull: flightLocationsOnward.arrivalFull,
                        location: `${flightLocationsOnward.departure} → ${flightLocationsOnward.arrival}`,
                        hotel: assignedDestinationOnwardHotel ? assignedDestinationOnwardHotel.name : (hasDestinationHotel ? destinationHotelName : ""),
                        transitHotel: assignedTransitOnwardHotel ? assignedTransitOnwardHotel.name : "",
                        roomNo: passenger.room_no || passenger.roomNo || 
                                (assignedDestinationOnwardHotel || hasDestinationHotel) ? 
                                (passenger.room_no || `T${Math.floor(Math.random() * 900) + 100}`) : "",
                        hotelRoomNo: passenger.hotel_room_no || passenger.hotelRoomNo || 
                                     (assignedDestinationOnwardHotel || hasDestinationHotel) ? 
                                     (passenger.hotel_room_no || `HR${Math.floor(Math.random() * 1000)}`) : "",
                        roomType: (assignedDestinationOnwardHotel || hasDestinationHotel) ? "Standard" : "",
                        durationOfNextFlight: gapInfoOnward.gap,
                        totalTravelDuration: totalTravelDurationOnward,
                        gapDetails: gapInfoOnward.details,
                        gapHours: gapInfoOnward.gapHours,
                        arvFlightFlightNo: onwardSortedSegments[0]?.flight_number || "N/A",
                        arvFlightDate: getSegmentDate(onwardSortedSegments[0], 'arrival'),
                        arvFlightArvTime: getSegmentTime(onwardSortedSegments[0], 'arrival'),
                        arvFlightAirport: onwardSortedSegments[0]?.to_airport || onwardSortedSegments[0]?.arrival_airport || "N/A",
                        depFlightFlightNo: nextFlightOnward?.flight_number || onwardSortedSegments[0]?.flight_number || "N/A",
                        depFlightDate: getSegmentDate(nextFlightOnward || onwardSortedSegments[0], 'departure'),
                        depFlightDepTime: getSegmentTime(nextFlightOnward || onwardSortedSegments[0], 'departure'),
                        depFlightAirport: nextFlightOnward?.from_airport || nextFlightOnward?.departure_airport || onwardSortedSegments[0]?.from_airport || "N/A",
                        segmentCount: onwardSegmentCount,
                        actualFlightSegments: onwardSortedSegments,
                        transitDates: transitDatesOnward,
                        destinationDates: destinationDatesOnward,
                        flightDirection: "onward",
                        assignedHotelName: assignedDestinationOnwardHotel ? assignedDestinationOnwardHotel.name : (hasDestinationHotel ? destinationHotelName : null),
                        stayType: passengerStayType,
                        shareWithM: passengerShareWithM,
                        lead_id: passenger.lead_id || null
                    };

                    // Process RETURN journey data if exists
                    if (returnSegmentCount > 0) {
                        const returnPassengerData = {
                            ...basePassengerData,
                            id: `${passengerKey}_return`,
                            srNo: finalReturnIndex,
                            category: "Final Destination (Return)",
                            hotelType: "Destination Hotel (Return)",
                            departureLocation: flightLocationsReturn.departure,
                            arrivalLocation: flightLocationsReturn.arrival,
                            departureLocationFull: flightLocationsReturn.departureFull,
                            arrivalLocationFull: flightLocationsReturn.arrivalFull,
                            location: `${flightLocationsReturn.departure} → ${flightLocationsReturn.arrival}`,
                            hotel: assignedDestinationReturnHotel ? assignedDestinationReturnHotel.name : "",
                            transitHotel: assignedTransitReturnHotel ? assignedTransitReturnHotel.name : "",
                            roomNo: passenger.room_no || passenger.roomNo || 
                                    (assignedDestinationReturnHotel ? `T${Math.floor(Math.random() * 900) + 100}` : ""),
                            hotelRoomNo: passenger.hotel_room_no || passenger.hotelRoomNo || 
                                         (assignedDestinationReturnHotel ? `HR${Math.floor(Math.random() * 1000)}` : ""),
                            roomType: assignedDestinationReturnHotel ? "Standard" : "",
                            durationOfNextFlight: gapInfoReturn.gap,
                            totalTravelDuration: totalTravelDurationReturn,
                            gapDetails: gapInfoReturn.details,
                            gapHours: gapInfoReturn.gapHours,
                            arvFlightFlightNo: returnSortedSegments[0]?.flight_number || "N/A",
                            arvFlightDate: getSegmentDate(returnSortedSegments[0], 'arrival'),
                            arvFlightArvTime: getSegmentTime(returnSortedSegments[0], 'arrival'),
                            arvFlightAirport: returnSortedSegments[0]?.to_airport || returnSortedSegments[0]?.arrival_airport || "N/A",
                            depFlightFlightNo: nextFlightReturn?.flight_number || returnSortedSegments[0]?.flight_number || "N/A",
                            depFlightDate: getSegmentDate(nextFlightReturn || returnSortedSegments[0], 'departure'),
                            depFlightDepTime: getSegmentTime(nextFlightReturn || returnSortedSegments[0], 'departure'),
                            depFlightAirport: nextFlightReturn?.from_airport || nextFlightReturn?.departure_airport || returnSortedSegments[0]?.from_airport || "N/A",
                            segmentCount: returnSegmentCount,
                            actualFlightSegments: returnSortedSegments,
                            transitDates: transitDatesReturn,
                            destinationDates: destinationDatesReturn,
                            flightDirection: "return",
                            assignedHotelName: assignedDestinationReturnHotel ? assignedDestinationReturnHotel.name : null,
                            stayType: passengerStayType,
                            shareWithM: passengerShareWithM,
                            lead_id: passenger.lead_id || null
                        };

                        if (existingFinalReturnPassengers.has(returnPassengerData.id)) {
                            const existing = existingFinalReturnPassengers.get(returnPassengerData.id);
                            returnPassengerData.srNo = existing.srNo || finalReturnIndex++;
                            finalReturnList.push(returnPassengerData);
                        } else {
                            returnPassengerData.srNo = finalReturnIndex++;
                            finalReturnList.push(returnPassengerData);
                        }

                        if (returnSegmentCount > 1) {
                            const returnTransitData = {
                                ...returnPassengerData,
                                srNo: transitReturnIndex,
                                category: "Transit (Return)",
                                hotelType: "Transit Hotel (Return)",
                                transitRoomNo: passenger.transit_room_no || passenger.transitRoomNo || 
                                               (assignedTransitReturnHotel ? `TR${Math.floor(Math.random() * 900) + 100}` : ""),
                                transitHotelRoomNo: passenger.transit_hotel_room_no || passenger.transitHotelRoomNo || 
                                                    (assignedTransitReturnHotel ? `THR${Math.floor(Math.random() * 1000)}` : ""),
                                transitRoomType: assignedTransitReturnHotel ? "Transit Standard" : "",
                                hotel: assignedDestinationReturnHotel ? assignedDestinationReturnHotel.name : "",
                                transitHotel: assignedTransitReturnHotel ? assignedTransitReturnHotel.name : "",
                                assignedTransitHotelName: assignedTransitReturnHotel ? assignedTransitReturnHotel.name : (hasTransitHotel ? transitHotelName : null),
                                stayType: passengerStayType,
                                shareWithM: passengerShareWithM,
                                lead_id: passenger.lead_id || null
                            };

                            if (existingTransitReturnPassengers.has(returnTransitData.id)) {
                                const existing = existingTransitReturnPassengers.get(returnTransitData.id);
                                returnTransitData.srNo = existing.srNo || transitReturnIndex++;
                                transitReturnList.push(returnTransitData);
                            } else {
                                returnTransitData.srNo = transitReturnIndex++;
                                transitReturnList.push(returnTransitData);
                            }
                        }
                    }

                    // Add to final destination lists for onward (always)
                    if (existingFinalOnwardPassengers.has(onwardPassengerData.id)) {
                        const existing = existingFinalOnwardPassengers.get(onwardPassengerData.id);
                        onwardPassengerData.srNo = existing.srNo || finalOnwardIndex++;
                        finalOnwardList.push(onwardPassengerData);
                    } else {
                        onwardPassengerData.srNo = finalOnwardIndex++;
                        finalOnwardList.push(onwardPassengerData);
                    }

                    // Add to transit lists for onward if multi-segment
                    if (onwardSegmentCount > 1) {
                        const onwardTransitData = {
                            ...onwardPassengerData,
                            srNo: transitOnwardIndex,
                            category: "Transit (Onward)",
                            hotelType: "Transit Hotel (Onward)",
                            transitRoomNo: passenger.transit_room_no || passenger.transitRoomNo || 
                                           (assignedTransitOnwardHotel ? `TR${Math.floor(Math.random() * 900) + 100}` : ""),
                            transitHotelRoomNo: passenger.transit_hotel_room_no || passenger.transitHotelRoomNo || 
                                                (assignedTransitOnwardHotel ? `THR${Math.floor(Math.random() * 1000)}` : ""),
                            transitRoomType: assignedTransitOnwardHotel ? "Transit Standard" : "",
                            hotel: assignedDestinationOnwardHotel ? assignedDestinationOnwardHotel.name : (hasDestinationHotel ? destinationHotelName : ""),
                            transitHotel: assignedTransitOnwardHotel ? assignedTransitOnwardHotel.name : "",
                            assignedTransitHotelName: assignedTransitOnwardHotel ? assignedTransitOnwardHotel.name : (hasTransitHotel ? transitHotelName : null),
                            stayType: passengerStayType,
                            shareWithM: passengerShareWithM,
                            lead_id: passenger.lead_id || null
                        };

                        if (existingTransitOnwardPassengers.has(onwardTransitData.id)) {
                            const existing = existingTransitOnwardPassengers.get(onwardTransitData.id);
                            onwardTransitData.srNo = existing.srNo || transitOnwardIndex++;
                            transitOnwardList.push(onwardTransitData);
                        } else {
                            onwardTransitData.srNo = transitOnwardIndex++;
                            transitOnwardList.push(onwardTransitData);
                        }
                    }
                });
            }
        });
        
        console.log("Transit onward flights count:", transitOnwardList.length);
        console.log("Transit return flights count:", transitReturnList.length);
        console.log("Final onward destinations count:", finalOnwardList.length);
        console.log("Final return destinations count:", finalReturnList.length);
        console.log("Pre Hotel count:", preHotelList.length);
        console.log("Post Hotel count:", postHotelList.length);
        
        setTransitOnwardFlights(transitOnwardList);
        setTransitReturnFlights(transitReturnList);
        setFinalOnwardDestinations(finalOnwardList);
        setFinalReturnDestinations(finalReturnList);
        setPreHotelPassengers(preHotelList);
        setPostHotelPassengers(postHotelList);
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

    // ==================== ROOM ASSIGNMENT MODAL RENDERERS ====================

    const renderRoomAssignmentModal = () => {
        if (!showRoomAssignmentModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Assign Room Number</h3>
                        <button
                            onClick={() => setShowRoomAssignmentModal(false)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passenger
                            </label>
                            <input
                                type="text"
                                value={roomAssignmentData.passengerName}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pax Code
                            </label>
                            <input
                                type="text"
                                value={roomAssignmentData.paxCode}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hotel Type
                            </label>
                            <select
                                value={roomAssignmentData.hotelType}
                                onChange={(e) => setRoomAssignmentData(prev => ({ ...prev, hotelType: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="destination">Destination Hotel</option>
                                <option value="transit">Transit Hotel</option>
                                <option value="preHotel">Pre-Hotel</option>
                                <option value="postHotel">Post-Hotel</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Flight Direction
                            </label>
                            <select
                                value={roomAssignmentData.flightDirection}
                                onChange={(e) => setRoomAssignmentData(prev => ({ ...prev, flightDirection: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="onward">Onward</option>
                                <option value="return">Return</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Room Number *
                            </label>
                            <input
                                type="text"
                                value={roomAssignmentData.roomNumber}
                                onChange={(e) => setRoomAssignmentData(prev => ({ ...prev, roomNumber: e.target.value }))}
                                placeholder="Enter room number (e.g., 101, A-102, Suite 201)"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lead ID
                            </label>
                            <input
                                type="text"
                                value={roomAssignmentData.leadId || ''}
                                onChange={(e) => setRoomAssignmentData(prev => ({ ...prev, leadId: e.target.value || null }))}
                                placeholder="Lead ID (optional)"
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                            onClick={() => setShowRoomAssignmentModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignRoomNumber}
                            disabled={!roomAssignmentData.roomNumber.trim() || roomAssignmentLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {roomAssignmentLoading ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin mr-2" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign Room'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER BATCH ROOM ASSIGNMENT MODAL ====================

    const renderBatchRoomAssignmentModal = () => {
        if (!showBatchRoomModal) return null;

        const filledCount = batchRoomData.assignments.filter(a => a.roomNumber?.trim() !== '').length;
        const totalCount = batchRoomData.assignments.length;

        const generateSequentialRooms = () => {
            const updated = batchRoomData.assignments.map((a, idx) => ({
                ...a,
                roomNumber: `R${String(idx + 1).padStart(3, '0')}`
            }));
            setBatchRoomData(prev => ({ ...prev, assignments: updated }));
        };

        const generatePrefixedRooms = (prefix) => {
            const updated = batchRoomData.assignments.map((a, idx) => ({
                ...a,
                roomNumber: `${prefix}${String(idx + 1).padStart(3, '0')}`
            }));
            setBatchRoomData(prev => ({ ...prev, assignments: updated }));
        };

        const clearAllRooms = () => {
            const updated = batchRoomData.assignments.map(a => ({
                ...a,
                roomNumber: ''
            }));
            setBatchRoomData(prev => ({ ...prev, assignments: updated }));
        };

        const autoFillRooms = () => {
            const pattern = batchRoomData.roomNumberPattern;
            if (!pattern) {
                generateSequentialRooms();
                return;
            }
            applyRoomNumberPattern();
        };

        const quickAssignPatterns = [
            { label: 'R-001', value: 'R-{index}' },
            { label: 'RM-001', value: 'RM-{index}' },
            { label: 'SUITE-001', value: 'SUITE-{index}' },
            { label: 'A-101', value: 'A-{index}' },
            { label: 'B-201', value: 'B-{index}' },
            { label: 'C-301', value: 'C-{index}' },
            { label: 'DELUXE-001', value: 'DELUXE-{index}' },
            { label: 'EXEC-001', value: 'EXEC-{index}' },
        ];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Batch Assign Room Numbers</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {filledCount} of {totalCount} passengers have room numbers assigned
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBatchRoomModal(false)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hotel Type
                                </label>
                                <select
                                    value={batchRoomData.hotelType}
                                    onChange={(e) => setBatchRoomData(prev => ({ ...prev, hotelType: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="destination">Destination Hotel</option>
                                    <option value="transit">Transit Hotel</option>
                                    <option value="preHotel">Pre-Hotel</option>
                                    <option value="postHotel">Post-Hotel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Flight Direction
                                </label>
                                <select
                                    value={batchRoomData.flightDirection}
                                    onChange={(e) => setBatchRoomData(prev => ({ ...prev, flightDirection: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="onward">Onward</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lead ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={batchRoomData.leadId || ''}
                                onChange={(e) => setBatchRoomData(prev => ({ ...prev, leadId: e.target.value || null }))}
                                placeholder="Enter Lead ID"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quick Actions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={generateSequentialRooms}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                >
                                    Sequential (R001, R002...)
                                </button>
                                <button
                                    onClick={() => generatePrefixedRooms('RM')}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                    Prefixed (RM001, RM002...)
                                </button>
                                <button
                                    onClick={clearAllRooms}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={autoFillRooms}
                                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                                >
                                    Apply Pattern
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quick Patterns
                            </label>
                            <div className="flex flex-wrap gap-2">
                            {quickAssignPatterns.map((pattern, patternIdx) => (
    <button
        key={patternIdx}
        onClick={() => {
            setBatchRoomData(prev => ({ 
                ...prev, 
                roomNumberPattern: pattern.value 
            }));
            setTimeout(() => {
                applyRoomNumberPattern();
            }, 100);
        }}
        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200"
    >
        {pattern.label}
    </button>
))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Room Number Pattern (Optional)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={batchRoomData.roomNumberPattern}
                                    onChange={(e) => setBatchRoomData(prev => ({ ...prev, roomNumberPattern: e.target.value }))}
                                    placeholder="Use {index} for sequential numbering (e.g., R-{index})"
                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={applyRoomNumberPattern}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Apply
                                </button>
                            </div>
<p className="text-xs text-gray-500 mt-1">
    {`Example: "R-{index}" → R-1, R-2, R-3, etc. | "RM-{index}" → RM-1, RM-2, etc.`}
</p>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-700">
                                    Passengers ({totalCount})
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {filledCount === totalCount ? '✅ All assigned' : `⚠️ ${totalCount - filledCount} remaining`}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                                {batchRoomData.assignments.map((a, passengerIdx) => (
                                    <div key={passengerIdx} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <span className="text-xs font-medium w-1/4 truncate">
                                            {a.passengerName}
                                        </span>
                                        <span className="text-xs text-gray-500 w-1/6">
                                            {a.paxCode}
                                        </span>
                                        <input
                                            type="text"
                                            value={a.roomNumber}
                                            onChange={(e) => {
                                                const updated = [...batchRoomData.assignments];
                                                updated[passengerIdx].roomNumber = e.target.value.toUpperCase();
                                                setBatchRoomData(prev => ({ ...prev, assignments: updated }));
                                            }}
                                            placeholder={`Room ${passengerIdx + 1}`}
                                            className="flex-1 p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    const updated = [...batchRoomData.assignments];
                                                    updated[passengerIdx].roomNumber = `R${String(passengerIdx + 1).padStart(3, '0')}`;
                                                    setBatchRoomData(prev => ({ ...prev, assignments: updated }));
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded text-[10px]"
                                                title="Auto-assign R001, R002..."
                                            >
                                                Auto
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const updated = [...batchRoomData.assignments];
                                                    updated[passengerIdx].roomNumber = '';
                                                    setBatchRoomData(prev => ({ ...prev, assignments: updated }));
                                                }}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded text-[10px]"
                                                title="Clear room number"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div>
                                    <span className="text-gray-500">Total</span>
                                    <p className="font-bold">{totalCount}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Assigned</span>
                                    <p className="font-bold text-green-600">{filledCount}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pending</span>
                                    <p className="font-bold text-orange-600">{totalCount - filledCount}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Progress</span>
                                    <p className="font-bold text-blue-600">
                                        {totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: totalCount > 0 ? `${(filledCount / totalCount) * 100}%` : '0%' 
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">PNR ID:</span> {batchRoomData.pnrId || 'N/A'}
                            {batchRoomData.leadId && (
                                <span className="ml-4"><span className="font-medium">Lead ID:</span> {batchRoomData.leadId}</span>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                            onClick={() => setShowBatchRoomModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={clearAllRooms}
                            className="px-4 py-2 border border-red-300 rounded text-red-600 hover:bg-red-50"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={handleBatchAssignRoomNumbers}
                            disabled={roomAssignmentLoading || filledCount === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {roomAssignmentLoading ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin mr-2" />
                                    Assigning...
                                </>
                            ) : (
                                `Assign ${filledCount} Room${filledCount !== 1 ? 's' : ''}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER MULTI-ASSIGN PANEL ====================

    const renderMultiAssignPanel = (hotelType, flightDirection = "onward") => {
        let selectedCount = 0;
        let selectedPassengers = [];
        
        if (hotelType === "preHotel") {
            selectedCount = selectedPreHotelPassengers.length;
            selectedPassengers = preHotelPassengers.filter(p => selectedPreHotelPassengers.includes(p.id));
        } else if (hotelType === "postHotel") {
            selectedCount = selectedPostHotelPassengers.length;
            selectedPassengers = postHotelPassengers.filter(p => selectedPostHotelPassengers.includes(p.id));
        } else if (hotelType === "transit") {
            if (flightDirection === "onward") {
                selectedCount = selectedTransitOnwardPassengers.length;
                selectedPassengers = transitOnwardFlights.filter(p => selectedTransitOnwardPassengers.includes(p.id));
            } else {
                selectedCount = selectedTransitReturnPassengers.length;
                selectedPassengers = transitReturnFlights.filter(p => selectedTransitReturnPassengers.includes(p.id));
            }
        } else {
            if (flightDirection === "onward") {
                selectedCount = selectedFinalOnwardPassengers.length;
                selectedPassengers = finalOnwardDestinations.filter(p => selectedFinalOnwardPassengers.includes(p.id));
            } else {
                selectedCount = selectedFinalReturnPassengers.length;
                selectedPassengers = finalReturnDestinations.filter(p => selectedFinalReturnPassengers.includes(p.id));
            }
        }
        
        if (selectedCount === 0) return null;

        const typeLabel = hotelType === "preHotel" ? "Pre" : 
                          hotelType === "postHotel" ? "Post" : 
                          hotelType === "transit" ? "Transit" : "Destination";
        
        const directionLabel = flightDirection === "onward" ? "Onward" : "Return";
        const title = hotelType === "preHotel" || hotelType === "postHotel" 
            ? `Multi-Assign ${typeLabel} Hotel to ${selectedCount} Selected Passenger(s)`
            : `Multi-Assign ${directionLabel} ${typeLabel} Hotel to ${selectedCount} Selected Passenger(s)`;

        return (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        {flightDirection === "onward" ? (
                            <ArrowRight size={16} className="text-blue-600 mr-2" />
                        ) : (
                            <ArrowLeft size={16} className="text-blue-600 mr-2" />
                        )}
                        <h3 className="text-sm font-semibold text-blue-800">
                            {title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const selectedPassengersList = getSelectedPassengers(hotelType, flightDirection);
                                if (selectedPassengersList.length > 0) {
                                    handleOpenBatchRoomAssignment(selectedPassengersList, hotelType, flightDirection);
                                } else {
                                    alert('No passengers selected for room assignment');
                                }
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center"
                        >
                            <Bed size={12} className="mr-1" />
                            Assign Rooms ({selectedCount})
                        </button>
                        <button
                            onClick={() => {
                                if (hotelType === "preHotel") {
                                    setSelectedPreHotelPassengers([]);
                                } else if (hotelType === "postHotel") {
                                    setSelectedPostHotelPassengers([]);
                                } else if (hotelType === "transit") {
                                    if (flightDirection === "onward") {
                                        setSelectedTransitOnwardPassengers([]);
                                    } else {
                                        setSelectedTransitReturnPassengers([]);
                                    }
                                } else {
                                    if (flightDirection === "onward") {
                                        setSelectedFinalOnwardPassengers([]);
                                    } else {
                                        setSelectedFinalReturnPassengers([]);
                                    }
                                }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Select Hotel *
                        </label>
                        <select
                            value={multiAssignHotel.hotelId}
                            onChange={(e) => setMultiAssignHotel(prev => ({ 
                                ...prev, 
                                hotelId: e.target.value,
                                hotelType: hotelType,
                                flightDirection: flightDirection
                            }))}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        >
                            <option value="">Select Hotel</option>
                            {availableHotels.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name} {h.rating ? `(${h.rating}⭐)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Room Type
                        </label>
                        <select
                            value={multiAssignHotel.roomType}
                            onChange={(e) => setMultiAssignHotel(prev => ({ ...prev, roomType: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        >
                            {roomTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Check-in Date
                        </label>
                        <input
                            type="date"
                            value={multiAssignHotel.checkInDate}
                            onChange={(e) => setMultiAssignHotel(prev => ({ ...prev, checkInDate: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Check-out Date
                        </label>
                        <input
                            type="date"
                            value={multiAssignHotel.checkOutDate}
                            onChange={(e) => setMultiAssignHotel(prev => ({ ...prev, checkOutDate: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Stay Type
                        </label>
                        <select
                            value={selectedStayType}
                            onChange={(e) => setSelectedStayType(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        >
                            <option value="hotel">Hotel</option>
                            <option value="lounge">Lounge</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Share with M
                        </label>
                        <select
                            value={selectedShareWithM}
                            onChange={(e) => setSelectedShareWithM(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            disabled={multiAssignHotel.isAssigning}
                        >
                            <option value="same">Same</option>
                            <option value="family">Family</option>
                            <option value="group">Group</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                        Selected passengers will receive the same hotel assignment
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                if (hotelType === "preHotel") {
                                    setSelectedPreHotelPassengers([]);
                                } else if (hotelType === "postHotel") {
                                    setSelectedPostHotelPassengers([]);
                                } else if (hotelType === "transit") {
                                    if (flightDirection === "onward") {
                                        setSelectedTransitOnwardPassengers([]);
                                    } else {
                                        setSelectedTransitReturnPassengers([]);
                                    }
                                } else {
                                    if (flightDirection === "onward") {
                                        setSelectedFinalOnwardPassengers([]);
                                    } else {
                                        setSelectedFinalReturnPassengers([]);
                                    }
                                }
                            }}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
                            disabled={multiAssignHotel.isAssigning}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (hotelType === "preHotel") {
                                    handleMultiAssignPreHotels();
                                } else if (hotelType === "postHotel") {
                                    handleMultiAssignPostHotels();
                                } else if (hotelType === "transit") {
                                    handleMultiAssignTransitHotels(flightDirection);
                                } else {
                                    handleMultiAssignDestinationHotels(flightDirection);
                                }
                            }}
                            disabled={!multiAssignHotel.hotelId || multiAssignHotel.isAssigning}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {multiAssignHotel.isAssigning ? (
                                <>
                                    <RefreshCw size={12} className="animate-spin mr-1" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Check size={12} className="mr-1" />
                                    Assign to {selectedCount} Passenger(s)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER HOTEL ASSIGNMENT CELL ====================

    const renderHotelAssignmentCell = (passenger, hotelType, flightDirection = "onward") => {
        const passengerKey = `${passenger.pnrData.pnrId}_${passenger.pnrData.passengerId}_${hotelType}_${flightDirection}`;
        const stayTypeKey = `${passenger.pnrData.pnrId}_${passenger.pnrData.passengerId}_${hotelType}_${flightDirection}_stayType`;
        const shareWithMKey = `${passenger.pnrData.pnrId}_${passenger.pnrData.passengerId}_${hotelType}_${flightDirection}_shareWithM`;
        
        let assignedHotelId = null;
        let assignedHotelName = null;
        
        if (hotelAssignments[passengerKey]) {
            assignedHotelId = hotelAssignments[passengerKey];
            const hotel = availableHotels.find(h => h.id === assignedHotelId);
            assignedHotelName = hotel?.name;
        }
        
        if (hotelType === 'destination' && flightDirection === 'onward') {
            if (passenger.pnrData?.hasExistingHotel && passenger.pnrData?.existingHotelName) {
                assignedHotelName = passenger.pnrData.existingHotelName;
                assignedHotelId = passenger.pnrData.existingHotelVendorId;
            }
        }
        
        if (hotelType === 'transit') {
            if (passenger.pnrData?.hasTransitHotel && passenger.pnrData?.transitHotelName) {
                assignedHotelName = passenger.pnrData.transitHotelName;
            }
        }
        
        if (hotelType === 'preHotel') {
            if (passenger.assignedPreHotelName) {
                assignedHotelName = passenger.assignedPreHotelName;
            }
        }
        
        if (hotelType === 'postHotel') {
            if (passenger.assignedPostHotelName) {
                assignedHotelName = passenger.assignedPostHotelName;
            }
        }
        
        if (!assignedHotelName) {
            if (hotelType === 'transit' && passenger.transitHotel) {
                assignedHotelName = passenger.transitHotel;
            } else if (hotelType === 'destination' && passenger.hotel) {
                assignedHotelName = passenger.hotel;
            } else if (hotelType === 'preHotel' && passenger.preHotel) {
                assignedHotelName = passenger.preHotel;
            } else if (hotelType === 'postHotel' && passenger.postHotel) {
                assignedHotelName = passenger.postHotel;
            }
        }
        
        // Get per-passenger stay type and share with M
        const currentStayType = passengerStayTypes[stayTypeKey] || passenger.stayType || selectedStayType || 'hotel';
        const currentShareWithM = passengerShareWithM[shareWithMKey] || passenger.shareWithM || selectedShareWithM || 'same';
        
        // Handlers for individual passenger changes
        const handleStayTypeChange = (key, value) => {
            setPassengerStayTypes(prev => ({
                ...prev,
                [key]: value
            }));
        };
        
        const handleShareWithMChange = (key, value) => {
            setPassengerShareWithM(prev => ({
                ...prev,
                [key]: value
            }));
        };
        
        let suggestedDates = {};
        if (hotelType === 'transit') {
            suggestedDates = calculateTransitHotelDates(passenger.pnrData.allSegments || [], flightDirection);
        } else if (hotelType === 'destination') {
            suggestedDates = calculateFinalDestinationDates(passenger.pnrData.allSegments || [], passenger, flightDirection);
        } else if (hotelType === 'preHotel') {
            suggestedDates = calculatePreHotelDates(passenger.pnrData.allSegments || []);
        } else if (hotelType === 'postHotel') {
            suggestedDates = calculatePostHotelDates(passenger.pnrData.allSegments || [], passenger);
        }
        
        const directionLabel = flightDirection === "onward" ? "Onward" : "Return";
        const hotelTypeLabel = hotelType === 'preHotel' ? 'Pre' : (hotelType === 'postHotel' ? 'Post' : (hotelType === 'transit' ? 'Transit' : 'Destination'));
        
        if (assignedHotelName) {
            return (
                <div className="space-y-1">
                    <div className="flex items-center text-green-600 bg-green-50 p-1.5 rounded border border-green-200">
                        <Check size={12} className="mr-1 flex-shrink-0" />
                        <span className="text-[10px] font-medium truncate" title={assignedHotelName}>
                            {assignedHotelName}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <span className={`px-1 py-0.5 rounded text-[8px] ${
                            currentStayType === 'lounge' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {currentStayType.charAt(0).toUpperCase() + currentStayType.slice(1)}
                        </span>
                        <span className={`px-1 py-0.5 rounded text-[8px] ${
                            currentShareWithM === 'family' 
                                ? 'bg-green-100 text-green-800' :
                            currentShareWithM === 'group' 
                                ? 'bg-orange-100 text-orange-800' : 
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {currentShareWithM.charAt(0).toUpperCase() + currentShareWithM.slice(1)}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleOpenRoomAssignment(passenger, hotelType, flightDirection)}
                            className="text-[8px] text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <Bed size={8} className="mr-0.5" />
                            Assign Room
                        </button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="space-y-1">
                <select
                    value=""
                    onChange={(e) => {
                        const selectedHotelId = e.target.value;
                        if (selectedHotelId) {
                            const selectedHotel = availableHotels.find(h => h.id === selectedHotelId);
                            const hotelName = selectedHotel?.name || "Unknown Hotel";
                            
                            let message = "";
                            if (hotelType === 'preHotel') {
                                message = `Assign Pre-Hotel "${hotelName}" to ${passenger.fullName}?\n\n` +
                                         `Departure Airport: ${suggestedDates.departureAirport || 'N/A'}\n` +
                                         `Suggested Dates: ${suggestedDates.checkIn} to ${suggestedDates.checkOut}\n` +
                                         `Stay Duration: ${suggestedDates.stayDuration || 1} day(s)\n` +
                                         `Stay Type: ${currentStayType}\n` +
                                         `Share With: ${currentShareWithM}`;
                            } else if (hotelType === 'postHotel') {
                                message = `Assign Post-Hotel "${hotelName}" to ${passenger.fullName}?\n\n` +
                                         `Arrival Airport: ${suggestedDates.arrivalAirport || 'N/A'}\n` +
                                         `Suggested Dates: ${suggestedDates.checkIn} to ${suggestedDates.checkOut}\n` +
                                         `Stay Duration: ${suggestedDates.stayDuration || 1} day(s)\n` +
                                         `Stay Type: ${currentStayType}\n` +
                                         `Share With: ${currentShareWithM}`;
                            } else if (hotelType === 'transit') {
                                if (suggestedDates.hasGap) {
                                    message = `Assign ${directionLabel} transit hotel "${hotelName}" to ${passenger.fullName}?\n\n` +
                                             `Flight Gap: ${suggestedDates.gapHours}h ${suggestedDates.gapMinutes}m\n` +
                                             `Suggested Dates: ${suggestedDates.checkIn} to ${suggestedDates.checkOut}\n` +
                                             `Between: ${suggestedDates.arrivalAirport || 'N/A'} → ${suggestedDates.departureAirport || 'N/A'}\n` +
                                             `Stay Type: ${currentStayType}\n` +
                                             `Share With: ${currentShareWithM}`;
                                } else {
                                    message = `WARNING: ${directionLabel} transit hotel not recommended!\n\n` +
                                             `Flight Gap: ${suggestedDates.gapHours}h ${suggestedDates.gapMinutes}m\n` +
                                             `Minimum required: ${settings.transitMinHours} hours\n\n` +
                                             `Do you still want to assign transit hotel "${hotelName}" to ${passenger.fullName}?\n` +
                                             `Stay Type: ${currentStayType}\n` +
                                             `Share With: ${currentShareWithM}`;
                                }
                            } else {
                                message = `Assign ${directionLabel} destination hotel "${hotelName}" to ${passenger.fullName}?\n\n` +
                                         `Arrival Airport: ${suggestedDates.arrivalAirport || 'N/A'}\n` +
                                         `Suggested Dates: ${suggestedDates.checkIn} to ${suggestedDates.checkOut}\n` +
                                         `Stay Duration: ${suggestedDates.stayDuration || 1} day(s)\n` +
                                         `Stay Type: ${currentStayType}\n` +
                                         `Share With: ${currentShareWithM}`;
                            }
                            
                            if (window.confirm(message)) {
                                handleAssignHotel(passenger, selectedHotelId, hotelType, flightDirection, {
                                    checkIn: suggestedDates.checkIn,
                                    checkOut: suggestedDates.checkOut
                                });
                            } else {
                                e.target.value = "";
                            }
                        }
                    }}
                    disabled={assigningHotel === passenger.id}
                    className={`w-full p-1 border rounded text-[9px] disabled:opacity-50 ${
                        hotelType === 'transit' && !suggestedDates.hasGap 
                            ? 'border-orange-300 bg-orange-50' 
                            : 'border-gray-300'
                    }`}
                >
                    <option value="">
                        {hotelType === 'preHotel' 
                            ? `Select Pre-Hotel`
                            : hotelType === 'postHotel'
                            ? `Select Post-Hotel`
                            : hotelType === 'transit' 
                            ? (suggestedDates.hasGap 
                                ? `Select ${directionLabel} Transit Hotel (${suggestedDates.gapHours}h gap)`
                                : `Not Recommended (${suggestedDates.gapHours}h gap)`)
                            : `Select ${directionLabel} Destination Hotel`}
                    </option>
                    {availableHotels.map(h => (
                        <option key={h.id} value={h.id}>
                            {h.name} {h.rating ? `(${h.rating}⭐)` : ''}
                        </option>
                    ))}
                </select>
                
                {assigningHotel === passenger.id && (
                    <div className="text-[8px] text-blue-600 flex items-center">
                        <RefreshCw size={8} className="animate-spin mr-1" />
                        Assigning...
                    </div>
                )}

                <div className="flex gap-1 mt-1">
                    <select 
                        className="w-1/2 p-0.5 border rounded text-[8px] border-gray-300"
                        value={currentStayType}
                        onChange={(e) => handleStayTypeChange(stayTypeKey, e.target.value)}
                    >
                        <option value="hotel">Hotel</option>
                        <option value="lounge">Lounge</option>
                    </select>
                    <select 
                        className="w-1/2 p-0.5 border rounded text-[8px] border-gray-300"
                        value={currentShareWithM}
                        onChange={(e) => handleShareWithMChange(shareWithMKey, e.target.value)}
                    >
                        <option value="same">Same</option>
                        <option value="family">Family</option>
                        <option value="group">Group</option>
                    </select>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => handleOpenRoomAssignment(passenger, hotelType, flightDirection)}
                        className="text-[8px] text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <Bed size={8} className="mr-0.5" />
                        Assign Room
                    </button>
                </div>
            </div>
        );
    };

    // ==================== FILTERING & PAGINATION ====================

    const filteredPnrPassengers = pnrPassengers.filter(pnr => {
        const searchTermLower = pnrSearchTerm.toLowerCase();
        return pnr.pnr_number?.toLowerCase().includes(searchTermLower) ||
               (Array.isArray(pnr.passengers) && pnr.passengers.some(p => 
                   p.first_name?.toLowerCase().includes(searchTermLower) ||
                   p.last_name?.toLowerCase().includes(searchTermLower) ||
                   p.passport_number?.toLowerCase().includes(searchTermLower) ||
                   p.pax_code?.toLowerCase().includes(searchTermLower) ||
                   p.form_data?.pax_code?.toLowerCase().includes(searchTermLower)
               ));
    });

    const totalPnrPages = Math.ceil(filteredPnrPassengers.length / pnrPerPage);
    const currentPnrPassengers = filteredPnrPassengers.slice(
        currentPnrPage * pnrPerPage,
        (currentPnrPage + 1) * pnrPerPage
    );

    // Filter transit onward flights by search term AND by minimum gap hours if enabled
    const filteredTransitOnwardFlights = transitOnwardFlights.filter(flight => {
        const searchTermLower = transitOnwardSearchTerm.toLowerCase();
        const matchesSearch = flight.fullName?.toLowerCase().includes(searchTermLower) ||
               flight.transitHotel?.toLowerCase().includes(searchTermLower) ||
               flight.location?.toLowerCase().includes(searchTermLower) ||
               flight.guestType?.toLowerCase().includes(searchTermLower) ||
               flight.paxCode?.toLowerCase().includes(searchTermLower);
        
        if (!matchesSearch) return false;
        
        if (settings.enableTransitFilter) {
            const gapHours = flight.gapHours || 0;
            return gapHours >= settings.transitMinHours;
        }
        
        return true;
    });

    // Filter transit return flights by search term AND by minimum gap hours if enabled
    const filteredTransitReturnFlights = transitReturnFlights.filter(flight => {
        const searchTermLower = transitReturnSearchTerm.toLowerCase();
        const matchesSearch = flight.fullName?.toLowerCase().includes(searchTermLower) ||
               flight.transitHotel?.toLowerCase().includes(searchTermLower) ||
               flight.location?.toLowerCase().includes(searchTermLower) ||
               flight.guestType?.toLowerCase().includes(searchTermLower) ||
               flight.paxCode?.toLowerCase().includes(searchTermLower);
        
        if (!matchesSearch) return false;
        
        if (settings.enableTransitFilter) {
            const gapHours = flight.gapHours || 0;
            return gapHours >= settings.transitMinHours;
        }
        
        return true;
    });

    // Filter Pre Hotel passengers (UNIFIED)
    const filteredPreHotelPassengers = preHotelPassengers.filter(item => {
        const searchLower = preHotelSearchTerm.toLowerCase();
        return item.fullName?.toLowerCase().includes(searchLower) ||
               item.paxCode?.toLowerCase().includes(searchLower) ||
               item.depFlightAirport?.toLowerCase().includes(searchLower);
    });

    // Filter Post Hotel passengers (UNIFIED)
    const filteredPostHotelPassengers = postHotelPassengers.filter(item => {
        const searchLower = postHotelSearchTerm.toLowerCase();
        return item.fullName?.toLowerCase().includes(searchLower) ||
               item.paxCode?.toLowerCase().includes(searchLower) ||
               item.arvFlightAirport?.toLowerCase().includes(searchLower);
    });

    // Filter final onward destinations
    const filteredFinalOnwardDestinations = finalOnwardDestinations.filter(dest => {
        const searchTermLower = finalOnwardSearchTerm.toLowerCase();
        return dest.fullName?.toLowerCase().includes(searchTermLower) ||
               dest.hotel?.toLowerCase().includes(searchTermLower) ||
               dest.location?.toLowerCase().includes(searchTermLower) ||
               dest.guestType?.toLowerCase().includes(searchTermLower) ||
               dest.paxCode?.toLowerCase().includes(searchTermLower);
    });

    // Filter final return destinations
    const filteredFinalReturnDestinations = finalReturnDestinations.filter(dest => {
        const searchTermLower = finalReturnSearchTerm.toLowerCase();
        return dest.fullName?.toLowerCase().includes(searchTermLower) ||
               dest.hotel?.toLowerCase().includes(searchTermLower) ||
               dest.location?.toLowerCase().includes(searchTermLower) ||
               dest.guestType?.toLowerCase().includes(searchTermLower) ||
               dest.paxCode?.toLowerCase().includes(searchTermLower);
    });

    const totalTransitOnwardPages = Math.ceil(filteredTransitOnwardFlights.length / transitPerPage);
    const currentTransitOnwardFlights = filteredTransitOnwardFlights.slice(
        currentTransitOnwardPage * transitPerPage,
        (currentTransitOnwardPage + 1) * transitPerPage
    );

    const totalTransitReturnPages = Math.ceil(filteredTransitReturnFlights.length / transitPerPage);
    const currentTransitReturnFlights = filteredTransitReturnFlights.slice(
        currentTransitReturnPage * transitPerPage,
        (currentTransitReturnPage + 1) * transitPerPage
    );

    const totalFinalOnwardPages = Math.ceil(filteredFinalOnwardDestinations.length / finalPerPage);
    const currentFinalOnwardDestinations = filteredFinalOnwardDestinations.slice(
        currentFinalOnwardPage * finalPerPage,
        (currentFinalOnwardPage + 1) * finalPerPage
    );

    const totalFinalReturnPages = Math.ceil(filteredFinalReturnDestinations.length / finalPerPage);
    const currentFinalReturnDestinations = filteredFinalReturnDestinations.slice(
        currentFinalReturnPage * finalPerPage,
        (currentFinalReturnPage + 1) * finalPerPage
    );

    // Pagination for Pre Hotel (UNIFIED)
    const totalPreHotelPages = Math.ceil(filteredPreHotelPassengers.length / preHotelPerPage);
    const currentPreHotelPassengers = filteredPreHotelPassengers.slice(
        currentPreHotelPage * preHotelPerPage,
        (currentPreHotelPage + 1) * preHotelPerPage
    );

    // Pagination for Post Hotel (UNIFIED)
    const totalPostHotelPages = Math.ceil(filteredPostHotelPassengers.length / postHotelPerPage);
    const currentPostHotelPassengers = filteredPostHotelPassengers.slice(
        currentPostHotelPage * postHotelPerPage,
        (currentPostHotelPage + 1) * postHotelPerPage
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

    const goToNextTransitOnwardPage = () => {
        if (currentTransitOnwardPage < totalTransitOnwardPages - 1) {
            setCurrentTransitOnwardPage(prev => prev + 1);
        }
    };

    const goToPrevTransitOnwardPage = () => {
        if (currentTransitOnwardPage > 0) {
            setCurrentTransitOnwardPage(prev => prev - 1);
        }
    };

    const goToNextTransitReturnPage = () => {
        if (currentTransitReturnPage < totalTransitReturnPages - 1) {
            setCurrentTransitReturnPage(prev => prev + 1);
        }
    };

    const goToPrevTransitReturnPage = () => {
        if (currentTransitReturnPage > 0) {
            setCurrentTransitReturnPage(prev => prev - 1);
        }
    };

    const goToNextFinalOnwardPage = () => {
        if (currentFinalOnwardPage < totalFinalOnwardPages - 1) {
            setCurrentFinalOnwardPage(prev => prev + 1);
        }
    };

    const goToPrevFinalOnwardPage = () => {
        if (currentFinalOnwardPage > 0) {
            setCurrentFinalOnwardPage(prev => prev - 1);
        }
    };

    const goToNextFinalReturnPage = () => {
        if (currentFinalReturnPage < totalFinalReturnPages - 1) {
            setCurrentFinalReturnPage(prev => prev + 1);
        }
    };

    const goToPrevFinalReturnPage = () => {
        if (currentFinalReturnPage > 0) {
            setCurrentFinalReturnPage(prev => prev - 1);
        }
    };

    // Pagination functions for Pre Hotel (UNIFIED)
    const goToNextPreHotelPage = () => {
        if (currentPreHotelPage < totalPreHotelPages - 1) {
            setCurrentPreHotelPage(prev => prev + 1);
        }
    };

    const goToPrevPreHotelPage = () => {
        if (currentPreHotelPage > 0) {
            setCurrentPreHotelPage(prev => prev - 1);
        }
    };

    // Pagination functions for Post Hotel (UNIFIED)
    const goToNextPostHotelPage = () => {
        if (currentPostHotelPage < totalPostHotelPages - 1) {
            setCurrentPostHotelPage(prev => prev + 1);
        }
    };

    const goToPrevPostHotelPage = () => {
        if (currentPostHotelPage > 0) {
            setCurrentPostHotelPage(prev => prev - 1);
        }
    };

    const handleExportData = () => {
        const allData = {
            transitOnwardFlights: transitOnwardFlights,
            transitReturnFlights: transitReturnFlights,
            finalOnwardDestinations: finalOnwardDestinations,
            finalReturnDestinations: finalReturnDestinations,
            preHotelPassengers: preHotelPassengers,
            postHotelPassengers: postHotelPassengers,
            labels: labels,
            settings: settings,
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

    // Add Stay Type Popup
    const renderAddStayTypePopup = () => {
        if (!showAddStayTypePopup) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Add Stay Type Rule</h2>
                        <button
                            onClick={() => setShowAddStayTypePopup(false)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Hours
                            </label>
                            <input
                                type="number"
                                value={newStayTypeConfig.minHours}
                                onChange={(e) => setNewStayTypeConfig(prev => ({
                                    ...prev,
                                    minHours: parseInt(e.target.value) || 0
                                }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                min="1"
                                max="72"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Hours
                            </label>
                            <input
                                type="number"
                                value={newStayTypeConfig.maxHours}
                                onChange={(e) => setNewStayTypeConfig(prev => ({
                                    ...prev,
                                    maxHours: parseInt(e.target.value) || 0
                                }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                min="1"
                                max="72"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stay Type
                            </label>
                            <select
                                value={newStayTypeConfig.stayType}
                                onChange={(e) => setNewStayTypeConfig(prev => ({
                                    ...prev,
                                    stayType: e.target.value
                                }))}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="Hotel">Hotel</option>
                                <option value="Lounge">Lounge</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                            onClick={() => setShowAddStayTypePopup(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setTransitStayTypes(prev => [
                                    ...prev,
                                    { 
                                        minHours: newStayTypeConfig.minHours, 
                                        maxHours: newStayTypeConfig.maxHours, 
                                        stayType: newStayTypeConfig.stayType 
                                    }
                                ]);
                                setTransitStayTypes(prev => 
                                    [...prev].sort((a, b) => a.minHours - b.minHours)
                                );
                                setShowAddStayTypePopup(false);
                                setNewStayTypeConfig({ minHours: 4, maxHours: 8, stayType: "Hotel" });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={!newStayTypeConfig.minHours || !newStayTypeConfig.maxHours || newStayTypeConfig.minHours >= newStayTypeConfig.maxHours}
                        >
                            Add Rule
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRoomImportModal = () => {
        if (!showRoomImportModal) return null;
        
        const getContextText = () => {
            if (importContext.tab === 'transit') {
                return `Transit ${importContext.direction || 'All'} Journey`;
            } else if (importContext.tab === 'final') {
                return `Final Destination ${importContext.direction || 'All'} Journey`;
            } else if (importContext.tab === 'preHotel') {
                return 'Pre-Hotel';
            } else if (importContext.tab === 'postHotel') {
                return 'Post-Hotel';
            }
            return '';
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-96 max-w-full">
                    <h3 className="text-lg font-semibold mb-4">Import Room Numbers</h3>
                    <p className="text-sm mb-3">
                        Upload a CSV file with a column named <strong>Pax Code</strong>.
                        <br/>
                        <span className="font-medium text-blue-600">{getContextText()}</span>
                    </p>
                    
                    <div className="mb-4 p-3 bg-blue-50 rounded text-xs">
                        <p className="font-semibold mb-1">CSV Format Example:</p>
                        <code className="block bg-white p-2 rounded border">
                            Pax Code,Room Number<br/>
                            PAX001,R101<br/>
                            PAX002,R102<br/>
                            PAX003,
                        </code>
                        <p className="mt-2 text-gray-600">
                            • Room Number is optional (will generate random if empty)<br/>
                            • Header names are case-insensitive<br/>
                            • Matches will update room numbers for selected tab
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleImportFileChange}
                        className="mb-4 w-full border p-2 rounded"
                    />
                    
                    {importFile && (
                        <p className="text-xs text-green-600 mb-2">
                            Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                        </p>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setShowRoomImportModal(false);
                                setImportFile(null);
                            }}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                            disabled={importProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={processImportFile}
                            disabled={!importFile || importProcessing}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {importProcessing ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                'Import'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER PRE HOTEL TAB (UNIFIED) ====================

    const renderPreHotelTab = () => {
        return (
            <div>
                {renderMultiAssignPanel("preHotel", "onward")}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pre Hotel Passengers</p>
                            <p className="font-bold text-sm">{preHotelPassengers.length}</p>
                        </div>
                        <Hotel size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedPreHotelPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Pre Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {preHotelPassengers.filter(h => h.assignedPreHotelName || h.preHotel).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Pre Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {preHotelPassengers.filter(h => !h.assignedPreHotelName && !h.preHotel).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSelectAllPreHotelPassengers}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentPreHotelPassengers.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedPreHotelPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search pre hotel..."
                                    value={preHotelSearchTerm}
                                    onChange={(e) => {
                                        setPreHotelSearchTerm(e.target.value);
                                        setCurrentPreHotelPage(0);
                                    }}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'preHotel', direction: '', subTab: '' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('preHotel');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Pre-Hotel Assignments (Before Departure)</h2>
                        <span className="text-gray-600">
                            Showing {currentPreHotelPage * preHotelPerPage + 1} to {Math.min((currentPreHotelPage + 1) * preHotelPerPage, filteredPreHotelPassengers.length)} of {filteredPreHotelPassengers.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        <input
                                            type="checkbox"
                                            checked={currentPreHotelPassengers.length > 0 && currentPreHotelPassengers.every(p => selectedPreHotelPassengers.includes(p.id))}
                                            onChange={handleSelectAllPreHotelPassengers}
                                            className="mr-2 rounded text-blue-600"
                                        />
                                        SR.NO
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Departure Info</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Room Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Assigned Hotel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPreHotelPassengers.length > 0 ? (
                                    currentPreHotelPassengers.map((item, idx) => {
                                        const isSelected = selectedPreHotelPassengers.includes(item.id);
                                        const stayTypeKey = `${item.pnrData.pnrId}_${item.pnrData.passengerId}_preHotel_onward_stayType`;
                                        const shareWithMKey = `${item.pnrData.pnrId}_${item.pnrData.passengerId}_preHotel_onward_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || item.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || item.shareWithM || selectedShareWithM || 'same';
                                        return (
                                            <tr key={item.id || idx} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handlePreHotelPassengerSelection(item.id)}
                                                            className="mr-2 rounded text-blue-600"
                                                        />
                                                        {idx + 1 + (currentPreHotelPage * preHotelPerPage)}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className="font-mono bg-gray-100 px-1 rounded">
                                                        {item.paxCode || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className="font-medium">{item.title || "Mr."}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r font-medium">{item.fullName}</td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded ${
                                                        (item.guestType || "General").includes("Veg") ? "bg-green-100 text-green-800" :
                                                        (item.guestType || "General").includes("Non-Veg") ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100"
                                                    }`}>
                                                        {item.guestType || "General"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <div className="text-[9px]">
                                                        <div>{item.depFlightDate} {item.depFlightDepTime}</div>
                                                        <div className="text-gray-500">{item.depFlightAirport}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 border-r">{item.hotelCheckIn || "N/A"}</td>
                                                <td className="px-2 py-1 border-r">{item.hotelCheckOut || "N/A"}</td>
                                                <td className="px-2 py-1 border-r font-mono">
                                                    {item.preHotelRoomNo || "-"}
                                                    {!item.preHotelRoomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(item, "preHotel", "onward")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    {item.preHotelRoomType || 
                                                        <select className="w-full p-0.5 border rounded text-[9px]">
                                                            <option value="">Select</option>
                                                            {roomTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    }
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(item, "preHotel", "onward")
                                                    ) : item.assignedPreHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={item.assignedPreHotelName}>
                                                                {item.assignedPreHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="text-center py-6 text-gray-500">
                                            No pre-hotel passengers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredPreHotelPassengers.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <span className="text-gray-600">
                                Page {currentPreHotelPage + 1} of {totalPreHotelPages}
                            </span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevPreHotelPage}
                                    disabled={currentPreHotelPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextPreHotelPage}
                                    disabled={currentPreHotelPage >= totalPreHotelPages - 1}
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

    // ==================== RENDER POST HOTEL TAB (UNIFIED) ====================

    const renderPostHotelTab = () => {
        return (
            <div>
                {renderMultiAssignPanel("postHotel", "onward")}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Post Hotel Passengers</p>
                            <p className="font-bold text-sm">{postHotelPassengers.length}</p>
                        </div>
                        <Hotel size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedPostHotelPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Post Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {postHotelPassengers.filter(h => h.assignedPostHotelName || h.postHotel).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Post Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {postHotelPassengers.filter(h => !h.assignedPostHotelName && !h.postHotel).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSelectAllPostHotelPassengers}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentPostHotelPassengers.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedPostHotelPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search post hotel..."
                                    value={postHotelSearchTerm}
                                    onChange={(e) => {
                                        setPostHotelSearchTerm(e.target.value);
                                        setCurrentPostHotelPage(0);
                                    }}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'postHotel', direction: '', subTab: '' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('postHotel');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Post-Hotel Assignments (After Arrival)</h2>
                        <span className="text-gray-600">
                            Showing {currentPostHotelPage * postHotelPerPage + 1} to {Math.min((currentPostHotelPage + 1) * postHotelPerPage, filteredPostHotelPassengers.length)} of {filteredPostHotelPassengers.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        <input
                                            type="checkbox"
                                            checked={currentPostHotelPassengers.length > 0 && currentPostHotelPassengers.every(p => selectedPostHotelPassengers.includes(p.id))}
                                            onChange={handleSelectAllPostHotelPassengers}
                                            className="mr-2 rounded text-blue-600"
                                        />
                                        SR.NO
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Arrival Info</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Room Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Assigned Hotel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPostHotelPassengers.length > 0 ? (
                                    currentPostHotelPassengers.map((item, idx) => {
                                        const isSelected = selectedPostHotelPassengers.includes(item.id);
                                        const stayTypeKey = `${item.pnrData.pnrId}_${item.pnrData.passengerId}_postHotel_onward_stayType`;
                                        const shareWithMKey = `${item.pnrData.pnrId}_${item.pnrData.passengerId}_postHotel_onward_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || item.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || item.shareWithM || selectedShareWithM || 'same';
                                        return (
                                            <tr key={item.id || idx} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handlePostHotelPassengerSelection(item.id)}
                                                            className="mr-2 rounded text-blue-600"
                                                        />
                                                        {idx + 1 + (currentPostHotelPage * postHotelPerPage)}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className="font-mono bg-gray-100 px-1 rounded">
                                                        {item.paxCode || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className="font-medium">{item.title || "Mr."}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r font-medium">{item.fullName}</td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded ${
                                                        (item.guestType || "General").includes("Veg") ? "bg-green-100 text-green-800" :
                                                        (item.guestType || "General").includes("Non-Veg") ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100"
                                                    }`}>
                                                        {item.guestType || "General"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <div className="text-[9px]">
                                                        <div>{item.arvFlightDate} {item.arvFlightArvTime}</div>
                                                        <div className="text-gray-500">{item.arvFlightAirport}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 border-r">{item.hotelCheckIn || "N/A"}</td>
                                                <td className="px-2 py-1 border-r">{item.hotelCheckOut || "N/A"}</td>
                                                <td className="px-2 py-1 border-r font-mono">
                                                    {item.postHotelRoomNo || "-"}
                                                    {!item.postHotelRoomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(item, "postHotel", "onward")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    {item.postHotelRoomType || 
                                                        <select className="w-full p-0.5 border rounded text-[9px]">
                                                            <option value="">Select</option>
                                                            {roomTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    }
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 border-r">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(item, "postHotel", "onward")
                                                    ) : item.assignedPostHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={item.assignedPostHotelName}>
                                                                {item.assignedPostHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="text-center py-6 text-gray-500">
                                            No post-hotel passengers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredPostHotelPassengers.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <span className="text-gray-600">
                                Page {currentPostHotelPage + 1} of {totalPostHotelPages}
                            </span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevPostHotelPage}
                                    disabled={currentPostHotelPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextPostHotelPage}
                                    disabled={currentPostHotelPage >= totalPostHotelPages - 1}
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

    // ==================== RENDER TRANSIT FLIGHT TAB ====================

    const renderTransitFlightTab = () => {
        console.log("=== renderTransitFlightTab called ===");
        
        return (
            <div className="text-[10px] leading-tight">
                {assignmentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle size={14} className="text-red-500 mr-2" />
                                <span className="text-red-700 text-[10px]">
                                    {typeof assignmentError === 'string' 
                                        ? assignmentError 
                                        : assignmentError.message}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        {assignmentError.details && (
                            <div className="mt-2 ml-6 text-[9px] text-red-600">
                                {assignmentError.details.map((detail, idx) => (
                                    <div key={idx}>
                                        {detail.passenger}: {detail.error}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {assignmentSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                <span className="text-green-700 text-[10px]">
                                    {assignmentSuccess.message}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-green-500 hover:text-green-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        {assignmentSuccess.details && (
                            <div className="mt-2 ml-6 text-[9px] text-green-600">
                                Successfully assigned to {assignmentSuccess.totalAssigned} passenger(s)
                                {assignmentSuccess.totalErrors > 0 && 
                                    <span className="ml-2 text-orange-600">
                                        ({assignmentSuccess.totalErrors} failed)
                                    </span>
                                }
                            </div>
                        )}
                    </div>
                )}

                {/* Main Transit Tabs - Pre Hotel, Transit Hotel, Post Hotel */}
                <div className="border-b mb-4">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => setTransitSubTab("preHotel")}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                transitSubTab === "preHotel"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>Pre Hotel</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                transitSubTab === "preHotel"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {preHotelPassengers.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setTransitSubTab("transit")}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                transitSubTab === "transit"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>Transit Hotel</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                transitSubTab === "transit"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {transitOnwardFlights.length + transitReturnFlights.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setTransitSubTab("postHotel")}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                transitSubTab === "postHotel"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>Post Hotel</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                transitSubTab === "postHotel"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {postHotelPassengers.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Render the appropriate tab based on selection */}
                {transitSubTab === "preHotel" ? (
                    renderPreHotelTab()
                ) : transitSubTab === "transit" ? (
                    transitDirectionTab === "onward" 
                        ? renderTransitOnwardTab() 
                        : renderTransitReturnTab()
                ) : (
                    renderPostHotelTab()
                )}
            </div>
        );
    };

    // ==================== RENDER TRANSIT ONWARD TAB ====================

    const renderTransitOnwardTab = () => {
        return (
            <div>
                {/* Direction tabs for Transit Hotel */}
                <div className="border-b mb-4 flex justify-between">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => {
                                setTransitDirectionTab("onward");
                                setCurrentTransitOnwardPage(0);
                            }}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                transitDirectionTab === "onward"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ArrowRight size={12} />
                            <span>Onward Journey</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                transitDirectionTab === "onward"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {filteredTransitOnwardFlights.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setTransitDirectionTab("return");
                                setCurrentTransitReturnPage(0);
                            }}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                transitDirectionTab === "return"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ArrowLeft size={12} />
                            <span>Return Journey</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                transitDirectionTab === "return"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {filteredTransitReturnFlights.length}
                            </span>
                        </button>
                    </nav>

                    <button
                        className="flex items-center gap-1 py-2 px-3 text-xs"
                        onClick={() => setActiveTab("settings2")}
                    >
                        <Settings size={10} />
                        <span>Setting</span>
                    </button>
                </div>

                {renderMultiAssignPanel("transit", "onward")}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Onward Multi-segment</p>
                            <p className="font-bold text-sm">{transitOnwardFlights.length}</p>
                        </div>
                        <ArrowRight size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedTransitOnwardPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Transit Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {transitOnwardFlights.filter(h => h.transitHotel || h.assignedTransitHotelName).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Transit Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {transitOnwardFlights.filter(h => !h.transitHotel && !h.assignedTransitHotelName).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Showing (≥{settings.transitMinHours}h)</p>
                            <p className="font-bold text-sm text-purple-600">
                                {filteredTransitOnwardFlights.length}
                            </p>
                        </div>
                        <Clock size={18} className="text-purple-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleSelectAllTransitPassengers("onward")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentTransitOnwardFlights.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedTransitOnwardPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search onward transit..."
                                    value={transitOnwardSearchTerm}
                                    onChange={(e) => setTransitOnwardSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'transit', direction: 'onward' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('transit', 'onward');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Onward Transit Flight Hotel Assignments (Multi-segment Passengers)</h2>
                        <span className="text-gray-600">
                            Showing {currentTransitOnwardPage * transitPerPage + 1} to {Math.min((currentTransitOnwardPage + 1) * transitPerPage, filteredTransitOnwardFlights.length)} of {filteredTransitOnwardFlights.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[150%] text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 w-[65px] py-1 text-left font-semibold border-r" rowSpan="2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={currentTransitOnwardFlights.length > 0 && 
                                                         currentTransitOnwardFlights.every(p => selectedTransitOnwardPassengers.includes(p.id))}
                                                onChange={() => handleSelectAllTransitPassengers("onward")}
                                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            SR.NO
                                        </div>
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Contact No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Location</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Remarks</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Assign H/L/D</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Category</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Duration</th>
                                    
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">ARRIVAL</th>
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">DEPARTURE</th>
                                </tr>
                                
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">From</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">To</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentTransitOnwardFlights.length > 0 ? (
                                    currentTransitOnwardFlights.map((transitFlight) => {
                                        const isSelected = selectedTransitOnwardPassengers.includes(transitFlight.id);
                                        const transitDates = transitFlight.transitDates || calculateTransitHotelDates(transitFlight.pnrData.allSegments || [], "onward");
                                        const assignedHotelName = transitFlight.transitHotel || transitFlight.assignedTransitHotelName;
                                        
                                        const checkIn = transitDates.checkIn || getDefaultCheckInDate();
                                        const checkOut = transitDates.checkOut || getDefaultCheckOutDate();
                                        const stayDuration = Math.ceil(
                                            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                        );
                                        
                                        const contactNo = transitFlight.pnrData?.passenger?.form_data?.phone_number || 
                                                          transitFlight.pnrData?.passenger?.form_data?.mobile_number || 
                                                          transitFlight.pnrData?.passenger?.phone || 
                                                          transitFlight.pnrData?.passenger?.guest_data?.phone || "N/A";
                                        
                                        const title = transitFlight.title || 
                                                     transitFlight.pnrData?.passenger?.form_data?.title || 
                                                     transitFlight.pnrData?.passenger?.title || "Mr.";
                                        
                                        const stayTypeKey = `${transitFlight.pnrData.pnrId}_${transitFlight.pnrData.passengerId}_transit_onward_stayType`;
                                        const shareWithMKey = `${transitFlight.pnrData.pnrId}_${transitFlight.pnrData.passengerId}_transit_onward_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || transitFlight.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || transitFlight.shareWithM || selectedShareWithM || 'same';
                                        
                                        const hotelSegment = transitFlight.pnrData?.allSegments?.find(s => 
                                            s.type === 'hotel' && 
                                            s.passenger_index === transitFlight.pnrData?.passengerIndex &&
                                            s.flight_direction === 'onward'
                                        );
                                        
                                        return (
                                            <tr key={transitFlight.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleTransitPassengerSelection(transitFlight.id, "onward")}
                                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        {transitFlight.srNo}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono text-[9px] bg-gray-100 px-1 py-0.5 rounded">
                                                        {transitFlight.paxCode || transitFlight.pnrData?.passenger?.pax_code || 
                                                         transitFlight.pnrData?.passenger?.form_data?.pax_code || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{transitFlight.fullName}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            (transitFlight.guestType || "General").includes("Hotel: Veg") ? "bg-green-100 text-green-800" :
                                                            (transitFlight.guestType || "General").includes("Hotel: Non-Veg") ? "bg-red-100 text-red-800" :
                                                            (transitFlight.guestType || "General").includes("Business") ? "bg-blue-100 text-blue-800" :
                                                            (transitFlight.guestType || "General").includes("Family") ? "bg-purple-100 text-purple-800" :
                                                            (transitFlight.guestType || "General").includes("Leisure") ? "bg-yellow-100 text-yellow-800" :
                                                            (transitFlight.guestType || "General").includes("Child") ? "bg-pink-100 text-pink-800" :
                                                            (transitFlight.guestType || "General").includes("Baby") ? "bg-pink-100 text-pink-800" :
                                                            (transitFlight.guestType || "General").includes("Young") ? "bg-yellow-100 text-yellow-800" :
                                                            (transitFlight.guestType || "General").includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {transitFlight.guestType || "General"}
                                                        </span>
                                                        {transitFlight.age && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {transitFlight.age}
                                                            </div>
                                                        )}
                                                        {transitFlight.dateOfBirth && (
                                                            <div className="text-[7px] text-gray-500">
                                                                DOB: {transitFlight.dateOfBirth}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-[9px]">{contactNo}</span>
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
                                                                <div className="text-[7px] text-blue-600 mt-0.5 font-medium">
                                                                    Onward Journey
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{transitFlight.remarks || 
                                                        (transitDates.message || transitDates.error || "-")}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(transitFlight, "transit", "onward")
                                                    ) : assignedHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={assignedHotelName}>
                                                                {assignedHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">
                                                        {hotelSegment?.transit_room_no || 
                                                         transitFlight.transitRoomNo || 
                                                         (assignedHotelName ? `TR${Math.floor(Math.random() * 900) + 100}` : "-")}
                                                    </span>
                                                    {!hotelSegment?.transit_room_no && !transitFlight.transitRoomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(transitFlight, "transit", "onward")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelSegment?.room_type || transitFlight.transitRoomType ? (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            (hotelSegment?.room_type || transitFlight.transitRoomType) === "Suite" ? "bg-purple-100 text-purple-800" :
                                                            (hotelSegment?.room_type || transitFlight.transitRoomType) === "Deluxe" ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {hotelSegment?.room_type || transitFlight.transitRoomType}
                                                        </span>
                                                    ) : (
                                                        <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                            <option value="">Select</option>
                                                            {roomTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                        <option value="">Select</option>
                                                        <option value="standard">Standard</option>
                                                        <option value="deluxe">Deluxe</option>
                                                        <option value="suite">Suite</option>
                                                        <option value="executive">Executive</option>
                                                    </select>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_in || transitFlight.hotelCheckIn || checkIn}
                                                        </span>
                                                        {transitDates.arrivalDateTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                After arrival: {transitFlight.arvFlightArvTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_out || transitFlight.hotelCheckOut || checkOut}
                                                        </span>
                                                        {transitDates.departureDateTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Before departure: {transitFlight.depFlightDepTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{stayDuration} night(s)</span>
                                                    <div className="text-[8px] text-gray-500">
                                                        Gap: {transitDates.gapHours}h {transitDates.gapMinutes}m
                                                    </div>
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
                                                    <span className="font-medium text-[9px]">{transitFlight.arvFlightAirport}</span>
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
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{transitFlight.depFlightAirport}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={30} className="text-center py-6 text-gray-500">
                                            No onward multi-segment passengers found with gap ≥ {settings.transitMinHours} hours.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredTransitOnwardFlights.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentTransitOnwardPage + 1} of {totalTransitOnwardPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevTransitOnwardPage}
                                    disabled={currentTransitOnwardPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextTransitOnwardPage}
                                    disabled={currentTransitOnwardPage >= totalTransitOnwardPages - 1}
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

    // ==================== RENDER TRANSIT RETURN TAB ====================

    const renderTransitReturnTab = () => {
        return (
            <div>
                {renderMultiAssignPanel("transit", "return")}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Return Multi-segment</p>
                            <p className="font-bold text-sm">{transitReturnFlights.length}</p>
                        </div>
                        <ArrowLeft size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedTransitReturnPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Transit Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {transitReturnFlights.filter(h => h.transitHotel || h.assignedTransitHotelName).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Transit Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {transitReturnFlights.filter(h => !h.transitHotel && !h.assignedTransitHotelName).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Showing (≥{settings.transitMinHours}h)</p>
                            <p className="font-bold text-sm text-purple-600">
                                {filteredTransitReturnFlights.length}
                            </p>
                        </div>
                        <Clock size={18} className="text-purple-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleSelectAllTransitPassengers("return")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentTransitReturnFlights.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedTransitReturnPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search return transit..."
                                    value={transitReturnSearchTerm}
                                    onChange={(e) => setTransitReturnSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'transit', direction: 'return' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('transit', 'return');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Return Transit Flight Hotel Assignments (Multi-segment Passengers)</h2>
                        <span className="text-gray-600">
                            Showing {currentTransitReturnPage * transitPerPage + 1} to {Math.min((currentTransitReturnPage + 1) * transitPerPage, filteredTransitReturnFlights.length)} of {filteredTransitReturnFlights.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[150%] text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 w-[65px] py-1 text-left font-semibold border-r" rowSpan="2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={currentTransitReturnFlights.length > 0 && 
                                                         currentTransitReturnFlights.every(p => selectedTransitReturnPassengers.includes(p.id))}
                                                onChange={() => handleSelectAllTransitPassengers("return")}
                                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            SR.NO
                                        </div>
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Contact No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Location</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Remarks</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Assign H/L/D</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Category</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Duration</th>
                                    
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">ARRIVAL</th>
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">DEPARTURE</th>
                                </tr>
                                
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">From</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">To</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentTransitReturnFlights.length > 0 ? (
                                    currentTransitReturnFlights.map((transitFlight) => {
                                        const isSelected = selectedTransitReturnPassengers.includes(transitFlight.id);
                                        const transitDates = transitFlight.transitDates || calculateTransitHotelDates(transitFlight.pnrData.allSegments || [], "return");
                                        const assignedHotelName = transitFlight.transitHotel || transitFlight.assignedTransitHotelName;
                                        
                                        const checkIn = transitDates.checkIn || getDefaultCheckInDate();
                                        const checkOut = transitDates.checkOut || getDefaultCheckOutDate();
                                        const stayDuration = Math.ceil(
                                            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                        );
                                        
                                        const contactNo = transitFlight.pnrData?.passenger?.form_data?.phone_number || 
                                                          transitFlight.pnrData?.passenger?.form_data?.mobile_number || 
                                                          transitFlight.pnrData?.passenger?.phone || 
                                                          transitFlight.pnrData?.passenger?.guest_data?.phone || "N/A";
                                        
                                        const title = transitFlight.title || 
                                                     transitFlight.pnrData?.passenger?.form_data?.title || 
                                                     transitFlight.pnrData?.passenger?.title || "Mr.";
                                        
                                        const stayTypeKey = `${transitFlight.pnrData.pnrId}_${transitFlight.pnrData.passengerId}_transit_return_stayType`;
                                        const shareWithMKey = `${transitFlight.pnrData.pnrId}_${transitFlight.pnrData.passengerId}_transit_return_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || transitFlight.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || transitFlight.shareWithM || selectedShareWithM || 'same';
                                        
                                        const hotelSegment = transitFlight.pnrData?.allSegments?.find(s => 
                                            s.type === 'hotel' && 
                                            s.passenger_index === transitFlight.pnrData?.passengerIndex &&
                                            s.flight_direction === 'return'
                                        );
                                        
                                        return (
                                            <tr key={transitFlight.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleTransitPassengerSelection(transitFlight.id, "return")}
                                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        {transitFlight.srNo}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono text-[9px] bg-gray-100 px-1 py-0.5 rounded">
                                                        {transitFlight.paxCode || transitFlight.pnrData?.passenger?.pax_code || 
                                                         transitFlight.pnrData?.passenger?.form_data?.pax_code || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{transitFlight.fullName}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            (transitFlight.guestType || "General").includes("Hotel: Veg") ? "bg-green-100 text-green-800" :
                                                            (transitFlight.guestType || "General").includes("Hotel: Non-Veg") ? "bg-red-100 text-red-800" :
                                                            (transitFlight.guestType || "General").includes("Business") ? "bg-blue-100 text-blue-800" :
                                                            (transitFlight.guestType || "General").includes("Family") ? "bg-purple-100 text-purple-800" :
                                                            (transitFlight.guestType || "General").includes("Leisure") ? "bg-yellow-100 text-yellow-800" :
                                                            (transitFlight.guestType || "General").includes("Child") ? "bg-pink-100 text-pink-800" :
                                                            (transitFlight.guestType || "General").includes("Baby") ? "bg-pink-100 text-pink-800" :
                                                            (transitFlight.guestType || "General").includes("Young") ? "bg-yellow-100 text-yellow-800" :
                                                            (transitFlight.guestType || "General").includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {transitFlight.guestType || "General"}
                                                        </span>
                                                        {transitFlight.age && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {transitFlight.age}
                                                            </div>
                                                        )}
                                                        {transitFlight.dateOfBirth && (
                                                            <div className="text-[7px] text-gray-500">
                                                                DOB: {transitFlight.dateOfBirth}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-[9px]">{contactNo}</span>
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
                                                                <div className="text-[7px] text-purple-600 mt-0.5 font-medium">
                                                                    Return Journey
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{transitFlight.remarks || 
                                                        (transitDates.message || transitDates.error || "-")}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(transitFlight, "transit", "return")
                                                    ) : assignedHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={assignedHotelName}>
                                                                {assignedHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">
                                                        {hotelSegment?.transit_room_no || 
                                                         transitFlight.transitRoomNo || 
                                                         (assignedHotelName ? `TR${Math.floor(Math.random() * 900) + 100}` : "-")}
                                                    </span>
                                                    {!hotelSegment?.transit_room_no && !transitFlight.transitRoomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(transitFlight, "transit", "return")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelSegment?.room_type || transitFlight.transitRoomType ? (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            (hotelSegment?.room_type || transitFlight.transitRoomType) === "Suite" ? "bg-purple-100 text-purple-800" :
                                                            (hotelSegment?.room_type || transitFlight.transitRoomType) === "Deluxe" ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {hotelSegment?.room_type || transitFlight.transitRoomType}
                                                        </span>
                                                    ) : (
                                                        <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                            <option value="">Select</option>
                                                            {roomTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                        <option value="">Select</option>
                                                        <option value="standard">Standard</option>
                                                        <option value="deluxe">Deluxe</option>
                                                        <option value="suite">Suite</option>
                                                        <option value="executive">Executive</option>
                                                    </select>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_in || transitFlight.hotelCheckIn || checkIn}
                                                        </span>
                                                        {transitDates.arrivalDateTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                After arrival: {transitFlight.arvFlightArvTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_out || transitFlight.hotelCheckOut || checkOut}
                                                        </span>
                                                        {transitDates.departureDateTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Before departure: {transitFlight.depFlightDepTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{stayDuration} night(s)</span>
                                                    <div className="text-[8px] text-gray-500">
                                                        Gap: {transitDates.gapHours}h {transitDates.gapMinutes}m
                                                    </div>
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
                                                    <span className="font-medium text-[9px]">{transitFlight.arvFlightAirport}</span>
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
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{transitFlight.depFlightAirport}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={30} className="text-center py-6 text-gray-500">
                                            No return multi-segment passengers found with gap ≥ {settings.transitMinHours} hours.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredTransitReturnFlights.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentTransitReturnPage + 1} of {totalTransitReturnPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevTransitReturnPage}
                                    disabled={currentTransitReturnPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextTransitReturnPage}
                                    disabled={currentTransitReturnPage >= totalTransitReturnPages - 1}
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

    // ==================== RENDER FINAL DESTINATION TAB ====================

    const renderFinalDestinationTab = () => {
        console.log("=== renderFinalDestinationTab called ===");
        
        return (
            <div className="text-[10px] leading-tight">
                {assignmentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle size={14} className="text-red-500 mr-2" />
                                <span className="text-red-700 text-[10px]">
                                    {typeof assignmentError === 'string' 
                                        ? assignmentError 
                                        : assignmentError.message}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        {assignmentError.details && (
                            <div className="mt-2 ml-6 text-[9px] text-red-600">
                                {assignmentError.details.map((detail, idx) => (
                                    <div key={idx}>
                                        {detail.passenger}: {detail.error}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {assignmentSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                <span className="text-green-700 text-[10px]">
                                    {assignmentSuccess.message}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-green-500 hover:text-green-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        {assignmentSuccess.details && (
                            <div className="mt-2 ml-6 text-[9px] text-green-600">
                                Successfully assigned to {assignmentSuccess.totalAssigned} passenger(s)
                                {assignmentSuccess.totalErrors > 0 && 
                                    <span className="ml-2 text-orange-600">
                                        ({assignmentSuccess.totalErrors} failed)
                                    </span>
                                }
                            </div>
                        )}
                    </div>
                )}

                <div className="border-b mb-4 flex items-center justify-between">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => {
                                setFinalDestinationDirectionTab("onward");
                                setCurrentFinalOnwardPage(0);
                            }}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                finalDestinationDirectionTab === "onward"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ArrowRight size={12} />
                            <span>Onward Journey</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    finalDestinationDirectionTab === "onward"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {finalOnwardDestinations.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setFinalDestinationDirectionTab("return");
                                setCurrentFinalReturnPage(0);
                            }}
                            className={`flex items-center gap-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors ${
                                finalDestinationDirectionTab === "return"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ArrowLeft size={12} />
                            <span>Return Journey</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    finalDestinationDirectionTab === "return"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {finalReturnDestinations.length}
                            </span>
                        </button>
                    </nav>

                    <button
                        className="flex items-center gap-1 py-2 px-3 text-xs"
                        onClick={() => setActiveTab("settings3")}
                    >
                        <Settings size={10} />
                        <span>Setting</span>
                    </button>
                </div>

                {finalDestinationDirectionTab === "onward" ? (
                    renderFinalOnwardTab()
                ) : (
                    renderFinalReturnTab()
                )}
            </div>
        );
    };

    // ==================== RENDER FINAL ONWARD TAB ====================

    const renderFinalOnwardTab = () => {
        return (
            <div>
                {renderMultiAssignPanel("destination", "onward")}

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Onward Passengers</p>
                            <p className="font-bold text-sm">{finalOnwardDestinations.length}</p>
                        </div>
                        <ArrowRight size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedFinalOnwardPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Destination Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {finalOnwardDestinations.filter(h => h.hotel || h.assignedHotelName || h.pnrData?.hasExistingHotel).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Destination Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {finalOnwardDestinations.filter(h => !h.hotel && !h.assignedHotelName && !h.pnrData?.hasExistingHotel).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Single Segment</p>
                            <p className="font-bold text-sm text-purple-600">
                                {finalOnwardDestinations.filter(h => h.segmentCount === 1).length}
                            </p>
                        </div>
                        <Plane size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Multi Segment</p>
                            <p className="font-bold text-sm text-orange-600">
                                {finalOnwardDestinations.filter(h => h.segmentCount > 1).length}
                            </p>
                        </div>
                        <Hotel size={18} className="text-orange-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleSelectAllFinalPassengers("onward")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentFinalOnwardDestinations.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedFinalOnwardPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search onward destinations..."
                                    value={finalOnwardSearchTerm}
                                    onChange={(e) => setFinalOnwardSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'final', direction: 'onward' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('final', 'onward');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Onward Final Destination Hotel Assignments</h2>
                        <span className="text-gray-600">
                            Showing {currentFinalOnwardPage * finalPerPage + 1} to {Math.min((currentFinalOnwardPage + 1) * finalPerPage, filteredFinalOnwardDestinations.length)} of {filteredFinalOnwardDestinations.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[150%] text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 w-[65px] py-1 text-left font-semibold border-r" rowSpan="2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={currentFinalOnwardDestinations.length > 0 && 
                                                         currentFinalOnwardDestinations.every(p => selectedFinalOnwardPassengers.includes(p.id))}
                                                onChange={() => handleSelectAllFinalPassengers("onward")}
                                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            SR.NO
                                        </div>
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Contact No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Location</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Remarks</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Assign H/L/D</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Category</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Duration</th>
                                    
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">ARRIVAL</th>
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">DEPARTURE</th>
                                    
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Flight Segments</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Transit Hotel Status</th>
                                </tr>
                                
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">From</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">To</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentFinalOnwardDestinations.length > 0 ? (
                                    currentFinalOnwardDestinations.map((destination) => {
                                        const segmentCount = destination.segmentCount || destination.pnrData.segmentCount || 0;
                                        const needsTransitHotel = segmentCount > 1;
                                        const hasTransitHotel = hotelAssignments[`${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_transit_onward`];
                                        const isSelected = selectedFinalOnwardPassengers.includes(destination.id);
                                        const destinationDates = destination.destinationDates || calculateFinalDestinationDates(destination.pnrData.allSegments || [], destination, "onward");
                                        const assignedHotelName = destination.hotel || destination.assignedHotelName || destination.pnrData?.existingHotelName;
                                        
                                        const checkIn = destinationDates.checkIn || getDefaultCheckInDate();
                                        const checkOut = destinationDates.checkOut || getDefaultCheckOutDate();
                                        const stayDuration = Math.ceil(
                                            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                        );
                                        
                                        const contactNo = destination.pnrData?.passenger?.form_data?.phone_number || 
                                                          destination.pnrData?.passenger?.form_data?.mobile_number || 
                                                          destination.pnrData?.passenger?.phone || 
                                                          destination.pnrData?.passenger?.guest_data?.phone || "N/A";
                                        
                                        const title = destination.title || 
                                                     destination.pnrData?.passenger?.form_data?.title || 
                                                     destination.pnrData?.passenger?.title || "Mr.";
                                        
                                        const stayTypeKey = `${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_destination_onward_stayType`;
                                        const shareWithMKey = `${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_destination_onward_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || destination.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || destination.shareWithM || selectedShareWithM || 'same';
                                        
                                        const hotelSegment = destination.pnrData?.allSegments?.find(s => 
                                            s.type === 'hotel' && 
                                            s.passenger_index === destination.pnrData?.passengerIndex &&
                                            s.flight_direction === 'onward'
                                        );
                                        
                                        return (
                                            <tr key={destination.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleFinalPassengerSelection(destination.id, "onward")}
                                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        {destination.srNo}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono text-[9px] bg-gray-100 px-1 py-0.5 rounded">
                                                        {destination.paxCode || destination.pnrData?.passenger?.pax_code || 
                                                         destination.pnrData?.passenger?.form_data?.pax_code || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{destination.fullName}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            (destination.guestType || "General").includes("Hotel: Veg") ? "bg-green-100 text-green-800" :
                                                            (destination.guestType || "General").includes("Hotel: Non-Veg") ? "bg-red-100 text-red-800" :
                                                            (destination.guestType || "General").includes("Business") ? "bg-blue-100 text-blue-800" :
                                                            (destination.guestType || "General").includes("Family") ? "bg-purple-100 text-purple-800" :
                                                            (destination.guestType || "General").includes("Leisure") ? "bg-yellow-100 text-yellow-800" :
                                                            (destination.guestType || "General").includes("Child") ? "bg-pink-100 text-pink-800" :
                                                            (destination.guestType || "General").includes("Baby") ? "bg-pink-100 text-pink-800" :
                                                            (destination.guestType || "General").includes("Young") ? "bg-yellow-100 text-yellow-800" :
                                                            (destination.guestType || "General").includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {destination.guestType || "General"}
                                                        </span>
                                                        {destination.age && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {destination.age}
                                                            </div>
                                                        )}
                                                        {destination.dateOfBirth && (
                                                            <div className="text-[7px] text-gray-500">
                                                                DOB: {destination.dateOfBirth}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-[9px]">{contactNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <MapPin size={8} className="mr-1 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-[9px]">
                                                                        {destination.departureLocation !== "N/A" ? destination.departureLocation : "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{destination.remarks || 
                                                        (destinationDates.message || "-")}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(destination, "destination", "onward")
                                                    ) : assignedHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={assignedHotelName}>
                                                                {assignedHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">
                                                        {hotelSegment?.room_no || 
                                                         destination.roomNo || 
                                                         (assignedHotelName ? `R${Math.floor(Math.random() * 900) + 100}` : "-")}
                                                    </span>
                                                    {!hotelSegment?.room_no && !destination.roomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(destination, "destination", "onward")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                        <option value="">Select</option>
                                                        <option value="standard">Standard</option>
                                                        <option value="deluxe">Deluxe</option>
                                                        <option value="suite">Suite</option>
                                                        <option value="executive">Executive</option>
                                                    </select>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_in || destination.hotelCheckIn || checkIn}
                                                        </span>
                                                        {destination.arvFlightArvTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                After arrival: {destination.arvFlightArvTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_out || destination.hotelCheckOut || checkOut}
                                                        </span>
                                                        <div className="text-[8px] text-gray-500">
                                                            Next day checkout
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{stayDuration} night(s)</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.arvFlightFlightNo}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    {destination.arvFlightDate}
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.arvFlightArvTime}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{destination.arvFlightAirport}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.depFlightFlightNo}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    {destination.depFlightDate}
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.depFlightDepTime}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{destination.depFlightAirport}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            segmentCount > 1 
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {segmentCount} Flight Segment{segmentCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {needsTransitHotel ? (
                                                        <div className="flex flex-col gap-1">
                                                            {hasTransitHotel ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-100 text-green-800">
                                                                    Transit Hotel Assigned
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-100 text-orange-800">
                                                                    Transit Hotel Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-800">
                                                            Not Required
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={29} className="text-center py-6 text-gray-500">
                                            No onward passengers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredFinalOnwardDestinations.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentFinalOnwardPage + 1} of {totalFinalOnwardPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevFinalOnwardPage}
                                    disabled={currentFinalOnwardPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextFinalOnwardPage}
                                    disabled={currentFinalOnwardPage >= totalFinalOnwardPages - 1}
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

    // ==================== RENDER FINAL RETURN TAB ====================

    const renderFinalReturnTab = () => {
        return (
            <div>
                {renderMultiAssignPanel("destination", "return")}

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Return Passengers</p>
                            <p className="font-bold text-sm">{finalReturnDestinations.length}</p>
                        </div>
                        <ArrowLeft size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Selected for Batch</p>
                            <p className="font-bold text-sm text-purple-600">
                                {selectedFinalReturnPassengers.length}
                            </p>
                        </div>
                        <Users size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Destination Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {finalReturnDestinations.filter(h => h.hotel || h.assignedHotelName).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Destination Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {finalReturnDestinations.filter(h => !h.hotel && !h.assignedHotelName).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Single Segment</p>
                            <p className="font-bold text-sm text-purple-600">
                                {finalReturnDestinations.filter(h => h.segmentCount === 1).length}
                            </p>
                        </div>
                        <Plane size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Multi Segment</p>
                            <p className="font-bold text-sm text-orange-600">
                                {finalReturnDestinations.filter(h => h.segmentCount > 1).length}
                            </p>
                        </div>
                        <Hotel size={18} className="text-orange-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleSelectAllFinalPassengers("return")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({currentFinalReturnDestinations.length})
                        </button>
                        <div className="text-xs text-gray-600">
                            {selectedFinalReturnPassengers.length} passenger(s) selected
                        </div>
                    </div>
                    
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search return destinations..."
                                    value={finalReturnSearchTerm}
                                    onChange={(e) => setFinalReturnSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <span onClick={() => setCallPop(true)} className="cursor-pointer">
                            <MoreVertical size={15} />
                        </span>

                        {CallPop && (
                            <div className="relative inline-block">
                                <div className="absolute right-0 top-[-20px] mt-2 w-[150px] rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    setImportContext({ tab: 'final', direction: 'return' });
                                                    setShowRoomImportModal(true);
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileUp size={10}/>
                                                Import Room Numbers
                                            </label>
                                        </li>
                                        <li className="px-0 py-0">
                                            <label
                                                onClick={() => {
                                                    handleExportRoomNumbers('final', 'return');
                                                    setCallPop(false);
                                                }}
                                                className="flex gap-1 items-center px-4 py-1 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <FileDown size={10}/>
                                                Export Room Numbers
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Return Final Destination Hotel Assignments</h2>
                        <span className="text-gray-600">
                            Showing {currentFinalReturnPage * finalPerPage + 1} to {Math.min((currentFinalReturnPage + 1) * finalPerPage, filteredFinalReturnDestinations.length)} of {filteredFinalReturnDestinations.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[150%] text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 w-[65px] py-1 text-left font-semibold border-r" rowSpan="2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={currentFinalReturnDestinations.length > 0 && 
                                                         currentFinalReturnDestinations.every(p => selectedFinalReturnPassengers.includes(p.id))}
                                                onChange={() => handleSelectAllFinalPassengers("return")}
                                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            SR.NO
                                        </div>
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Pax Code</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Title</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Full Name</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Guest Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Contact No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Location</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Remarks</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Type</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Assign H/L/D</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Share with M</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Room Category</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-IN</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Check-OUT</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Stay Duration</th>
                                    
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">ARRIVAL</th>
                                    <th className="px-2 py-1 text-center font-semibold border-r" colSpan="4">DEPARTURE</th>
                                    
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Flight Segments</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r" rowSpan="2">Transit Hotel Status</th>
                                </tr>
                                
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">From</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">F/T No</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Date</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">Time</th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">To</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentFinalReturnDestinations.length > 0 ? (
                                    currentFinalReturnDestinations.map((destination) => {
                                        const segmentCount = destination.segmentCount || destination.pnrData.segmentCount || 0;
                                        const needsTransitHotel = segmentCount > 1;
                                        const hasTransitHotel = hotelAssignments[`${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_transit_return`];
                                        const isSelected = selectedFinalReturnPassengers.includes(destination.id);
                                        const destinationDates = destination.destinationDates || calculateFinalDestinationDates(destination.pnrData.allSegments || [], destination, "return");
                                        const assignedHotelName = destination.hotel || destination.assignedHotelName;
                                        
                                        const checkIn = destinationDates.checkIn || getDefaultCheckInDate();
                                        const checkOut = destinationDates.checkOut || getDefaultCheckOutDate();
                                        const stayDuration = Math.ceil(
                                            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                        );
                                        
                                        const contactNo = destination.pnrData?.passenger?.form_data?.phone_number || 
                                                          destination.pnrData?.passenger?.form_data?.mobile_number || 
                                                          destination.pnrData?.passenger?.phone || 
                                                          destination.pnrData?.passenger?.guest_data?.phone || "N/A";
                                        
                                        const title = destination.title || 
                                                     destination.pnrData?.passenger?.form_data?.title || 
                                                     destination.pnrData?.passenger?.title || "Mr.";
                                        
                                        const stayTypeKey = `${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_destination_return_stayType`;
                                        const shareWithMKey = `${destination.pnrData.pnrId}_${destination.pnrData.passengerId}_destination_return_shareWithM`;
                                        const displayStayType = passengerStayTypes[stayTypeKey] || destination.stayType || selectedStayType || 'hotel';
                                        const displayShareWithM = passengerShareWithM[shareWithMKey] || destination.shareWithM || selectedShareWithM || 'same';
                                        
                                        const hotelSegment = destination.pnrData?.allSegments?.find(s => 
                                            s.type === 'hotel' && 
                                            s.passenger_index === destination.pnrData?.passengerIndex &&
                                            s.flight_direction === 'return'
                                        );
                                        
                                        return (
                                            <tr key={destination.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleFinalPassengerSelection(destination.id, "return")}
                                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        {destination.srNo}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono text-[9px] bg-gray-100 px-1 py-0.5 rounded">
                                                        {destination.paxCode || destination.pnrData?.passenger?.pax_code || 
                                                         destination.pnrData?.passenger?.form_data?.pax_code || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{destination.fullName}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            (destination.guestType || "General").includes("Hotel: Veg") ? "bg-green-100 text-green-800" :
                                                            (destination.guestType || "General").includes("Hotel: Non-Veg") ? "bg-red-100 text-red-800" :
                                                            (destination.guestType || "General").includes("Business") ? "bg-blue-100 text-blue-800" :
                                                            (destination.guestType || "General").includes("Family") ? "bg-purple-100 text-purple-800" :
                                                            (destination.guestType || "General").includes("Leisure") ? "bg-yellow-100 text-yellow-800" :
                                                            (destination.guestType || "General").includes("Child") ? "bg-pink-100 text-pink-800" :
                                                            (destination.guestType || "General").includes("Baby") ? "bg-pink-100 text-pink-800" :
                                                            (destination.guestType || "General").includes("Young") ? "bg-yellow-100 text-yellow-800" :
                                                            (destination.guestType || "General").includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {destination.guestType || "General"}
                                                        </span>
                                                        {destination.age && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {destination.age}
                                                            </div>
                                                        )}
                                                        {destination.dateOfBirth && (
                                                            <div className="text-[7px] text-gray-500">
                                                                DOB: {destination.dateOfBirth}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-[9px]">{contactNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <MapPin size={8} className="mr-1 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-[9px]">
                                                                        {destination.departureLocation !== "N/A" ? destination.departureLocation : "N/A"}
                                                                    </span>
                                                                    <span className="mx-1 text-[8px]">→</span>
                                                                    <span className="font-medium text-[9px]">
                                                                        {destination.arrivalLocation !== "N/A" ? destination.arrivalLocation : "N/A"}
                                                                    </span>
                                                                </div>
                                                                {destination.departureLocationFull && destination.arrivalLocationFull && 
                                                                 destination.departureLocationFull !== "N/A" && destination.arrivalLocationFull !== "N/A" && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        <div className="truncate max-w-[120px]" title={destination.departureLocationFull}>
                                                                            From: {destination.departureLocationFull}
                                                                        </div>
                                                                        <div className="truncate max-w-[120px]" title={destination.arrivalLocationFull}>
                                                                            To: {destination.arrivalLocationFull}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="text-[7px] text-purple-600 mt-0.5 font-medium">
                                                                    Return Final Destination
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{destination.remarks || 
                                                        (destinationDates.message || "-")}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayStayType === 'lounge' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {displayStayType.charAt(0).toUpperCase() + displayStayType.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        renderHotelAssignmentCell(destination, "destination", "return")
                                                    ) : assignedHotelName ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 p-1 rounded border border-green-200">
                                                            <Check size={10} className="mr-1 flex-shrink-0" />
                                                            <span className="text-[9px] font-medium truncate" title={assignedHotelName}>
                                                                {assignedHotelName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        displayShareWithM === 'family' 
                                                            ? 'bg-green-100 text-green-800' :
                                                        displayShareWithM === 'group' 
                                                            ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {displayShareWithM.charAt(0).toUpperCase() + displayShareWithM.slice(1)}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">
                                                        {hotelSegment?.room_no || 
                                                         destination.roomNo || 
                                                         (assignedHotelName ? `R${Math.floor(Math.random() * 900) + 100}` : "-")}
                                                    </span>
                                                    {!hotelSegment?.room_no && !destination.roomNo && (
                                                        <button
                                                            onClick={() => handleOpenRoomAssignment(destination, "destination", "return")}
                                                            className="ml-1 text-[8px] text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Bed size={8} />
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <select className="w-full p-1 border rounded text-[9px] border-gray-300">
                                                        <option value="">Select</option>
                                                        <option value="standard">Standard</option>
                                                        <option value="deluxe">Deluxe</option>
                                                        <option value="suite">Suite</option>
                                                        <option value="executive">Executive</option>
                                                    </select>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_in || destination.hotelCheckIn || checkIn}
                                                        </span>
                                                        {destination.arvFlightArvTime && (
                                                            <div className="text-[8px] text-gray-500">
                                                                After arrival: {destination.arvFlightArvTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[9px]">
                                                            {hotelSegment?.check_out || destination.hotelCheckOut || checkOut}
                                                        </span>
                                                        <div className="text-[8px] text-gray-500">
                                                            Next day checkout
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{stayDuration} night(s)</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.arvFlightFlightNo}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    {destination.arvFlightDate}
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.arvFlightArvTime}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{destination.arvFlightAirport}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.depFlightFlightNo}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    {destination.depFlightDate}
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{destination.depFlightDepTime}</span>
                                                </td>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium text-[9px]">{destination.depFlightAirport}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            segmentCount > 1 
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {segmentCount} Flight Segment{segmentCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {needsTransitHotel ? (
                                                        <div className="flex flex-col gap-1">
                                                            {hasTransitHotel ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-100 text-green-800">
                                                                    Transit Hotel Assigned
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-100 text-orange-800">
                                                                    Transit Hotel Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-800">
                                                            Not Required
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={29} className="text-center py-6 text-gray-500">
                                            No return passengers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredFinalReturnDestinations.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentFinalReturnPage + 1} of {totalFinalReturnPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevFinalReturnPage}
                                    disabled={currentFinalReturnPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextFinalReturnPage}
                                    disabled={currentFinalReturnPage >= totalFinalReturnPages - 1}
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

    // ==================== RENDER SETTINGS TAB ====================

    const renderSettingsTab = () => {
        const placeholders = [
            { label: "Passenger Name", value: "{{passenger_name}}" },
            { label: "PNR Number", value: "{{pnr_number}}" },
            { label: "Hotel Name", value: "{{hotel_name}}" },
            { label: "Check-in Date", value: "{{checkin_date}}" },
            { label: "Check-out Date", value: "{{checkout_date}}" },
            { label: "Room Number", value: "{{room_number}}" },
            { label: "Flight Number", value: "{{flight_number}}" },
            { label: "Departure Time", value: "{{departure_time}}" }
        ];

        const handleAddTemplate = () => {
            setEditingTemplate(null);
            setTemplateForm({
                subject: "",
                content: "",
                isActive: true,
                type: "email",
                recipients: []
            });
            setShowTemplatePopup(true);
        };

        const handleEditTemplate = (template) => {
            setEditingTemplate(template);
            setTemplateForm(template);
            setShowTemplatePopup(true);
        };

        const handleSaveTemplate = () => {
            if (!templateForm.subject.trim() || !templateForm.content.trim()) {
                alert("Please fill in both subject and content");
                return;
            }

            if (editingTemplate) {
                setNotificationTemplates(prev => 
                    prev.map(t => t.id === editingTemplate.id ? { ...templateForm, id: editingTemplate.id } : t)
                );
            } else {
                setNotificationTemplates(prev => [
                    ...prev,
                    { ...templateForm, id: Date.now() }
                ]);
            }
            
            setShowTemplatePopup(false);
            setEditingTemplate(null);
        };

        const handleDeleteTemplate = (templateId) => {
            if (window.confirm("Are you sure you want to delete this template?")) {
                setNotificationTemplates(prev => prev.filter(t => t.id !== templateId));
            }
        };

        const handleToggleTemplate = (templateId) => {
            setNotificationTemplates(prev => 
                prev.map(t => t.id === templateId ? { ...t, isActive: !t.isActive } : t)
            );
        };

        const insertPlaceholder = (placeholder) => {
            setTemplateForm(prev => ({
                ...prev,
                content: prev.content + placeholder
            }));
        };

        return (
            <div className="bg-white rounded-lg shadow border">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Application Settings</h2>
                    
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Notification Templates</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddTemplate}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                    >
                                        <Plus size={14} />
                                        Add Template
                                    </button>
                                </div>

                                <div className="space-y-3 mt-4">
                                    {notificationTemplates.length > 0 ? (
                                        notificationTemplates.map(template => (
                                            <div key={template.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <div className="mt-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={template.isActive}
                                                                onChange={() => handleToggleTemplate(template.id)}
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-sm">{template.subject}</h4>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                                    template.type === 'email' ? 'bg-blue-100 text-blue-800' :
                                                                    template.type === 'sms' ? 'bg-green-100 text-green-800' :
                                                                    'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                    {template.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                {template.content}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-xs text-gray-500">
                                                                    Recipients: {template.recipients.length || 0} selected
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditTemplate(template)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                                    className="text-xs text-red-600 hover:text-red-800"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">No notification templates created yet</p>
                                            <button
                                                type="button"
                                                onClick={handleAddTemplate}
                                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Create your first template
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {notificationTemplates.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Active Templates Preview</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-3">
                                            These templates will be used for automatic notifications when:
                                        </p>
                                        <ul className="text-xs text-gray-600 space-y-2">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Hotel assigned to passenger
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                Check-in/check-out reminder
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                Flight delay/cancellation
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {showTemplatePopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold">
                                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                </h3>
                                <button
                                    onClick={() => setShowTemplatePopup(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[60vh]">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notification Type
                                        </label>
                                        <div className="flex gap-4">
                                            {['email', 'sms', 'push'].map(type => (
                                                <label key={type} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={type}
                                                        checked={templateForm.type === type}
                                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm capitalize">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={templateForm.subject}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Enter notification subject"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                            <span>{templateForm.subject.length} characters</span>
                                            <span>Max 100 characters</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content
                                        </label>
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            {placeholders.map(p => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => insertPlaceholder(p.value)}
                                                    className="px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200"
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={templateForm.content}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Enter notification content. Use placeholders above for dynamic content."
                                            rows={6}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                            <span>{templateForm.content.length} characters</span>
                                            <span>Max 500 characters</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Send To
                                        </label>
                                        <div className="space-y-2">
                                            {['Passenger', 'Travel Agent', 'Hotel', 'Operations Team'].map(recipient => (
                                                <label key={recipient} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={templateForm.recipients.includes(recipient)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setTemplateForm(prev => ({
                                                                    ...prev,
                                                                    recipients: [...prev.recipients, recipient]
                                                                }));
                                                            } else {
                                                                setTemplateForm(prev => ({
                                                                    ...prev,
                                                                    recipients: prev.recipients.filter(r => r !== recipient)
                                                                }));
                                                            }
                                                        }}
                                                        className="mr-2 rounded text-blue-600"
                                                    />
                                                    <span className="text-sm">{recipient}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={templateForm.isActive}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="mr-2 rounded text-blue-600"
                                        />
                                        <span className="text-sm">Active (will be used for automatic notifications)</span>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                                        <div className="bg-gray-50 p-3 rounded border">
                                            <div className="text-xs font-medium text-gray-700">
                                                Subject: {templateForm.subject || 'No subject'}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                                                {templateForm.content || 'No content'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTemplatePopup(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTemplate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingTemplate ? 'Update Template' : 'Create Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ==================== RENDER SETTINGS TAB 2 ====================

    const renderSettingsTab2 = () => (
        <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold mb-6">Transit Hotel Setting</h2>
                    <p className='mb-0 text-[10px] flex gap-1'>
                        <img src={bookImage} className='mt-0 w-[15px] h-[15px]'/>
                        Learn More About The Transit Hotel Setting
                    </p>
                </div>
                
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Transit Hotel Filter Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Transit Hours: <span className="text-blue-600 font-bold">{settings.transitMinHours}</span> hours
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xs text-gray-500">1h</span>
                                        <input
                                            type="range"
                                            name="transitMinHours"
                                            min="1"
                                            max={settings.transitMaxHours}
                                            value={settings.transitMinHours}
                                            onChange={handleSettingsChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-xs text-gray-500">{settings.transitMaxHours}h</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Only show passengers with flight gap ≥ {settings.transitMinHours} hours in Transit tabs
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Stay Type Rules (by gap hours)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddStayTypePopup(true)}
                                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                        >
                                            <Plus size={12} />
                                            Add Rule
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {transitStayTypes.map((config, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                <span className="text-xs">
                                                    {config.minHours}h - {config.maxHours}h
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    config.stayType === "Hotel" 
                                                        ? "bg-blue-100 text-blue-800" 
                                                        : "bg-purple-100 text-purple-800"
                                                }`}>
                                                    {config.stayType}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTransitStayTypes(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="ml-auto text-red-500 hover:text-red-700"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {transitStayTypes.length === 0 && (
                                            <p className="text-xs text-gray-500 italic">No rules configured. Default: Hotel</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Stay Type
                                    </label>
                                    <div className="flex gap-5 items-center">
                                        <select
                                            name="defaultRoomType"
                                            value={settings.defaultRoomType}
                                            onChange={handleSettingsChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {StayType.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <Plus size={20}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {settings.enableTransitFilter && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800">
                                        Transit Filter Preview (Onward):
                                    </span>
                                    <span className="text-sm text-blue-600">
                                        {transitOnwardFlights.filter(f => (f.gapHours || 0) >= settings.transitMinHours).length} of {transitOnwardFlights.length} passengers meet ≥{settings.transitMinHours}h criteria
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${transitOnwardFlights.length > 0 
                                                ? (transitOnwardFlights.filter(f => (f.gapHours || 0) >= settings.transitMinHours).length / transitOnwardFlights.length) * 100 
                                                : 0}%` 
                                        }}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-sm font-medium text-purple-800">
                                        Transit Filter Preview (Return):
                                    </span>
                                    <span className="text-sm text-purple-600">
                                        {transitReturnFlights.filter(f => (f.gapHours || 0) >= settings.transitMinHours).length} of {transitReturnFlights.length} passengers meet ≥{settings.transitMinHours}h criteria
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${transitReturnFlights.length > 0 
                                                ? (transitReturnFlights.filter(f => (f.gapHours || 0) >= settings.transitMinHours).length / transitReturnFlights.length) * 100 
                                                : 0}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
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
                                exportFormat: "csv",
                                transitMinHours: 4,
                                transitMaxHours: 24,
                                enableTransitFilter: true
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

    // ==================== SETTINGS TAB 3 ====================

    const SettingsTab3 = ({ 
        settings, 
        setSettings, 
        enabled, 
        setEnabled, 
        bookImage
    }) => {
        const [validationSelections, setValidationSelections] = useState({});
        const [groupingSelections, setGroupingSelections] = useState({});
        const [showValidationDropdown, setShowValidationDropdown] = useState(null);
        const [showGroupingDropdown, setShowGroupingDropdown] = useState(null);
        
        const [users, setUsers] = useState([
            { name: "Akshay Kaul", email: "akshayk@hiwalk.in", license: "Microsoft 365 Business Basic" },
        ]);

        const finalDestinationHeaders = [
            "Pax Code",
            "Title",
            "Full Name",
            "Guest Type",
            "Contact No",
            "Location",
            "Remarks",
            "Stay Type",
            "Assign H/L/D",
            "Share with M",
            "Room No",
            "Room Type",
            "Room Category",
            "Check-IN",
            "Check-OUT",
            "Stay Duration",
            "ARRIVAL F/T No",
            "ARRIVAL Date",
            "ARRIVAL Time",
            "ARRIVAL From",
            "DEPARTURE F/T No",
            "DEPARTURE Date",
            "DEPARTURE Time",
            "DEPARTURE To",
            "Flight Segments",
            "Transit Hotel Status"
        ];

        const groupingOptions = [
            "Same",
            "Family",
            "Group",
            "Couple",
            "Business",
            "Leisure"
        ];

        const handleValidationSelect = (rowIndex, header, checked) => {
            setValidationSelections(prev => {
                const current = prev[rowIndex] || { selected: [] };
                let newSelected;
                
                if (checked) {
                    newSelected = [...current.selected, header];
                } else {
                    newSelected = current.selected.filter(h => h !== header);
                }
                
                return {
                    ...prev,
                    [rowIndex]: { selected: newSelected }
                };
            });
        };

        const handleGroupingSelect = (rowIndex, option, checked) => {
            setGroupingSelections(prev => {
                const current = prev[rowIndex] || { selected: [] };
                let newSelected;
                
                if (checked) {
                    newSelected = [...current.selected, option];
                } else {
                    newSelected = current.selected.filter(o => o !== option);
                }
                
                return {
                    ...prev,
                    [rowIndex]: { selected: newSelected }
                };
            });
        };

        const removeValidationItem = (rowIndex, header) => {
            setValidationSelections(prev => {
                const current = prev[rowIndex];
                if (!current) return prev;
                
                const newSelected = current.selected.filter(h => h !== header);
                
                if (newSelected.length === 0) {
                    const newPrev = { ...prev };
                    delete newPrev[rowIndex];
                    return newPrev;
                }
                
                return {
                    ...prev,
                    [rowIndex]: { selected: newSelected }
                };
            });
        };

        const removeGroupingItem = (rowIndex, option) => {
            setGroupingSelections(prev => {
                const current = prev[rowIndex];
                if (!current) return prev;
                
                const newSelected = current.selected.filter(o => o !== option);
                
                if (newSelected.length === 0) {
                    const newPrev = { ...prev };
                    delete newPrev[rowIndex];
                    return newPrev;
                }
                
                return {
                    ...prev,
                    [rowIndex]: { selected: newSelected }
                };
            });
        };

        const handleAddRow = () => {
            const newUser = {
                name: `User ${users.length + 1}`,
                email: `user${users.length + 1}@example.com`,
                license: "Standard License"
            };
            
            setUsers(prev => [...prev, newUser]);
        };

        const handleDeleteRow = (index) => {
            if (window.confirm(`Are you sure you want to delete row ${index + 1}?`)) {
                setUsers(prev => prev.filter((_, i) => i !== index));
                
                setValidationSelections(prev => {
                    const newPrev = { ...prev };
                    delete newPrev[index];
                    return newPrev;
                });
                
                setGroupingSelections(prev => {
                    const newPrev = { ...prev };
                    delete newPrev[index];
                    return newPrev;
                });
            }
        };

        const getGroupingDisplayText = (rowIndex) => {
            const selections = groupingSelections[rowIndex]?.selected;
            if (!selections || selections.length === 0) {
                return <span className="text-gray-400 text-xs">Select grouping...</span>;
            }
            
            return selections.map((option, i) => (
                <span 
                    key={i} 
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                >
                    {option}
                    <X 
                        size={12} 
                        className="cursor-pointer hover:text-green-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeGroupingItem(rowIndex, option);
                        }}
                    />
                </span>
            ));
        };

        const getValidationDisplayText = (rowIndex) => {
            const selections = validationSelections[rowIndex]?.selected;
            if (!selections || selections.length === 0) {
                return <span className="text-gray-400 text-xs">Select headers...</span>;
            }
            
            return selections.map((header, i) => (
                <span 
                    key={i} 
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                >
                    {header}
                    <X 
                        size={12} 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeValidationItem(rowIndex, header);
                        }}
                    />
                </span>
            ));
        };

        const handleSaveSettings3 = (e) => {
            e.preventDefault();
            
            const settingsData = {
                enabled,
                validationSelections,
                groupingSelections,
                defaultRoomType: settings?.defaultRoomType || "Standard",
                users
            };
            
            console.log("Saving settings:", settingsData);
            alert("Settings saved successfully!");
        };

        return (
            <div className="bg-white rounded-lg shadow border">
                <div className="p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-bold mb-6">Hotel Room Sharing Validation Settings</h2>
                        <p className='mb-0 text-[10px] flex gap-1'>
                            <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book" />
                            Learn More About Hotel Room Sharing
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <p className="text-[14px] text-[#2d322d]">Enable Hotel Room Sharer Validation</p>
                        <button
                            type="button"
                            onClick={() => setEnabled(!enabled)}
                            className={`relative w-9 h-4 flex items-center rounded-full transition-colors duration-300 ${
                                enabled ? "bg-blue-600" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute w-2 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                    enabled ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="p-6 min-h-screen">
                        <div className="bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-center">
                                    <tr>
                                        <th className="p-3">Label ↑</th>
                                        <th className="p-3">Validation On</th>
                                        <th className="p-3">Grouping</th>
                                        <th className="p-3">
                                            <button
                                                type="button"
                                                onClick={handleAddRow}
                                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                                title="Add new row"
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={index} className="border-t text-center hover:bg-gray-50">
                                                <td className="p-3 font-medium">
                                                    {index + 1}
                                                </td>

                                                <td className="p-3 relative">
                                                    <div className="relative">
                                                        <div 
                                                            className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 min-h-[38px] items-center"
                                                            onClick={() => setShowValidationDropdown(showValidationDropdown === index ? null : index)}
                                                        >
                                                            {getValidationDisplayText(index)}
                                                            <ChevronDown size={14} className="ml-auto text-gray-400" />
                                                        </div>

                                                        {showValidationDropdown === index && (
                                                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                <div className="p-2">
                                                                    <div className="text-xs font-semibold text-gray-500 mb-2 border-b pb-1">
                                                                        Final Destination Headers
                                                                    </div>
                                                                    {finalDestinationHeaders.map((header, i) => (
                                                                        <label key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={validationSelections[index]?.selected?.includes(header) || false}
                                                                                onChange={(e) => handleValidationSelect(index, header, e.target.checked)}
                                                                                className="rounded text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            <span className="text-xs">{header}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-3 relative">
                                                    <div className="relative">
                                                        <div 
                                                            className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 min-h-[38px] items-center"
                                                            onClick={() => setShowGroupingDropdown(showGroupingDropdown === index ? null : index)}
                                                        >
                                                            {getGroupingDisplayText(index)}
                                                            <ChevronDown size={14} className="ml-auto text-gray-400" />
                                                        </div>

                                                        {showGroupingDropdown === index && (
                                                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                <div className="p-2">
                                                                    <div className="text-xs font-semibold text-gray-500 mb-2 border-b pb-1">
                                                                        Grouping Options
                                                                    </div>
                                                                    {groupingOptions.map((option, i) => (
                                                                        <label key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={groupingSelections[index]?.selected?.includes(option) || false}
                                                                                onChange={(e) => handleGroupingSelect(index, option, e.target.checked)}
                                                                                className="rounded text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            <span className="text-xs">{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-3">
                                                    <button 
                                                        type="button"
                                                        className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete row"
                                                        onClick={() => handleDeleteRow(index)}
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-500">
                                                No data configured. Click the + button to add a new row.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold mb-3">Current Validation Rules:</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-600 mb-2">Validation On Selections:</h4>
                                        {Object.keys(validationSelections).length > 0 ? (
                                            Object.entries(validationSelections).map(([rowIndex, data]) => (
                                                <div key={rowIndex} className="mb-2 text-xs">
                                                    <span className="font-medium">Label {parseInt(rowIndex) + 1}:</span>{' '}
                                                    {data.selected.join(', ')}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No validation rules configured</p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-600 mb-2">Grouping Selections:</h4>
                                        {Object.keys(groupingSelections).length > 0 ? (
                                            Object.entries(groupingSelections).map(([rowIndex, data]) => (
                                                <div key={rowIndex} className="mb-2 text-xs">
                                                    <span className="font-medium">Label {parseInt(rowIndex) + 1}:</span>{' '}
                                                    {data.selected.join(', ')}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No grouping rules configured</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveSettings3}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Check size={16} />
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER TAB CONTENT ====================

    const renderTabContent = () => {
        switch (activeTab) {
            case "transitFlight":
                return renderTransitFlightTab();
            case "finalDestination":
                return renderFinalDestinationTab();
            case "hotelWise":
                return renderHotelWiseTab();
            case "settings":
                return renderSettingsTab();
            case "settings2":
                return renderSettingsTab2();
            case "settings3":
                return <SettingsTab3 
                    settings={settings}
                    setSettings={setSettings}
                    enabled={enabled}
                    setEnabled={setEnabled}
                    bookImage={bookImage}
                />;  
            default:
                return renderTransitFlightTab();
        }
    };

    // ==================== RENDER HOTEL WISE TAB ====================

    const renderHotelWiseTab = () => {
        console.log("=== renderHotelWiseTab called ===");
        
        const hotelGroups = {};
        
        const allPassengers = [
            ...finalOnwardDestinations.map(p => ({ ...p, journeyType: 'onward', hotelType: 'destination' })),
            ...finalReturnDestinations.map(p => ({ ...p, journeyType: 'return', hotelType: 'destination' })),
            ...transitOnwardFlights.map(p => ({ ...p, journeyType: 'onward', hotelType: 'transit' })),
            ...transitReturnFlights.map(p => ({ ...p, journeyType: 'return', hotelType: 'transit' })),
            ...preHotelPassengers.map(p => ({ ...p, journeyType: 'unified', hotelType: 'preHotel' })),
            ...postHotelPassengers.map(p => ({ ...p, journeyType: 'unified', hotelType: 'postHotel' }))
        ];
        
        allPassengers.forEach(passenger => {
            let hotelName = null;
            let hotelId = null;
            let hotelType = passenger.hotelType || 'destination';
            let journeyType = passenger.journeyType || 'onward';
            let checkInDate = null;
            let checkOutDate = null;
            let roomType = null;
            let roomNo = null;
            let confirmationNumber = null;
            let stayType = passenger.stayType || selectedStayType || 'hotel';
            let shareWithM = passenger.shareWithM || selectedShareWithM || 'same';
            
            if (hotelType === 'transit') {
                hotelName = passenger.transitHotel || passenger.assignedTransitHotelName;
                roomNo = passenger.transitRoomNo;
                roomType = passenger.transitRoomType;
                
                if (passenger.transitDates) {
                    checkInDate = passenger.transitDates.checkIn;
                    checkOutDate = passenger.transitDates.checkOut;
                } else if (passenger.pnrData) {
                    const transitDates = calculateTransitHotelDates(passenger.pnrData.allSegments || [], journeyType);
                    checkInDate = transitDates.checkIn;
                    checkOutDate = transitDates.checkOut;
                }
                
                if (passenger.pnrData?.transitHotelConfirmationNumber) {
                    confirmationNumber = passenger.pnrData.transitHotelConfirmationNumber;
                }
            } else if (hotelType === 'preHotel') {
                hotelName = passenger.preHotel || passenger.assignedPreHotelName;
                roomNo = passenger.preHotelRoomNo;
                roomType = passenger.preHotelRoomType;
                stayType = passenger.stayType || selectedStayType || 'hotel';
                shareWithM = passenger.shareWithM || selectedShareWithM || 'same';
                
                if (passenger.preHotelDates) {
                    checkInDate = passenger.preHotelDates.checkIn;
                    checkOutDate = passenger.preHotelDates.checkOut;
                } else if (passenger.pnrData) {
                    const preHotelDates = calculatePreHotelDates(passenger.pnrData.allSegments || []);
                    checkInDate = preHotelDates.checkIn;
                    checkOutDate = preHotelDates.checkOut;
                }
            } else if (hotelType === 'postHotel') {
                hotelName = passenger.postHotel || passenger.assignedPostHotelName;
                roomNo = passenger.postHotelRoomNo;
                roomType = passenger.postHotelRoomType;
                stayType = passenger.stayType || selectedStayType || 'hotel';
                shareWithM = passenger.shareWithM || selectedShareWithM || 'same';
                
                if (passenger.postHotelDates) {
                    checkInDate = passenger.postHotelDates.checkIn;
                    checkOutDate = passenger.postHotelDates.checkOut;
                } else if (passenger.pnrData) {
                    const postHotelDates = calculatePostHotelDates(passenger.pnrData.allSegments || [], passenger);
                    checkInDate = postHotelDates.checkIn;
                    checkOutDate = postHotelDates.checkOut;
                }
            } else {
                hotelName = passenger.hotel || passenger.assignedHotelName || passenger.pnrData?.existingHotelName;
                roomNo = passenger.roomNo;
                roomType = passenger.roomType;
                stayType = passenger.stayType || selectedStayType || 'hotel';
                shareWithM = passenger.shareWithM || selectedShareWithM || 'same';
                
                if (passenger.destinationDates) {
                    checkInDate = passenger.destinationDates.checkIn;
                    checkOutDate = passenger.destinationDates.checkOut;
                } else if (passenger.pnrData) {
                    const destDates = calculateFinalDestinationDates(passenger.pnrData.allSegments || [], passenger, journeyType);
                    checkInDate = destDates.checkIn;
                    checkOutDate = destDates.checkOut;
                }
                
                if (passenger.pnrData?.hotelConfirmationNumber) {
                    confirmationNumber = passenger.pnrData.hotelConfirmationNumber;
                }
            }
            
            if (hotelName) {
                const hotelKey = `${hotelName}_${hotelType}_${journeyType}`;
                
                if (!hotelGroups[hotelKey]) {
                    const hotelDetails = availableHotels.find(h => 
                        h.name === hotelName || 
                        (passenger.pnrData?.existingHotelVendorId && h.id === passenger.pnrData.existingHotelVendorId)
                    );
                    
                    hotelGroups[hotelKey] = {
                        id: hotelKey,
                        name: hotelName,
                        hotelId: passenger.pnrData?.existingHotelVendorId || hotelDetails?.id,
                        hotelType: hotelType,
                        journeyType: journeyType,
                        rating: hotelDetails?.rating,
                        address: hotelDetails?.address,
                        email: hotelDetails?.email,
                        phone: hotelDetails?.phone,
                        passengers: [],
                        totalRooms: 0,
                        checkIns: {},
                        roomTypes: {},
                        stayTypes: {},
                        shareWithMs: {}
                    };
                }
                
                hotelGroups[hotelKey].passengers.push({
                    ...passenger,
                    assignedHotelName: hotelName,
                    assignedHotelId: passenger.pnrData?.existingHotelVendorId,
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    roomNo: roomNo,
                    roomType: roomType,
                    confirmationNumber: confirmationNumber,
                    hotelType: hotelType,
                    journeyType: journeyType,
                    stayType: stayType,
                    shareWithM: shareWithM
                });
                
                hotelGroups[hotelKey].totalRooms++;
                
                if (checkInDate) {
                    hotelGroups[hotelKey].checkIns[checkInDate] = (hotelGroups[hotelKey].checkIns[checkInDate] || 0) + 1;
                }
                
                if (roomType) {
                    hotelGroups[hotelKey].roomTypes[roomType] = (hotelGroups[hotelKey].roomTypes[roomType] || 0) + 1;
                }
                
                if (stayType) {
                    hotelGroups[hotelKey].stayTypes[stayType] = (hotelGroups[hotelKey].stayTypes[stayType] || 0) + 1;
                }
                
                if (shareWithM) {
                    hotelGroups[hotelKey].shareWithMs[shareWithM] = (hotelGroups[hotelKey].shareWithMs[shareWithM] || 0) + 1;
                }
            }
        });
        
        const hotelList = Object.values(hotelGroups).sort((a, b) => a.name.localeCompare(b.name));
        
        const toggleHotelExpand = (hotelId) => {
            setExpandedHotels(prev => ({
                ...prev,
                [hotelId]: !prev[hotelId]
            }));
        };
        
        const expandAll = () => {
            const allExpanded = {};
            hotelList.forEach(hotel => {
                allExpanded[hotel.id] = true;
            });
            setExpandedHotels(allExpanded);
        };
        
        const collapseAll = () => {
            setExpandedHotels({});
        };
        
        const filteredHotels = hotelList.filter(hotel => {
            const searchLower = hotelWiseSearchTerm.toLowerCase();
            return hotel.name.toLowerCase().includes(searchLower) ||
                   hotel.passengers.some(p => 
                       p.fullName.toLowerCase().includes(searchLower) ||
                       (p.paxCode && p.paxCode.toLowerCase().includes(searchLower))
                   );
        });
        
        return (
            <div className="text-[10px] leading-tight">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Total Hotels Used</p>
                            <p className="font-bold text-sm">{hotelList.length}</p>
                        </div>
                        <Hotel size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Total Rooms Assigned</p>
                            <p className="font-bold text-sm text-green-600">
                                {hotelList.reduce((sum, h) => sum + h.passengers.length, 0)}
                            </p>
                        </div>
                        <Bed size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Destination Hotels</p>
                            <p className="font-bold text-sm text-purple-600">
                                {hotelList.filter(h => h.hotelType === 'destination').length}
                            </p>
                        </div>
                        <Navigation size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Transit Hotels</p>
                            <p className="font-bold text-sm text-orange-600">
                                {hotelList.filter(h => h.hotelType === 'transit').length}
                            </p>
                        </div>
                        <Clock size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pre/Post Hotels</p>
                            <p className="font-bold text-sm text-blue-600">
                                {hotelList.filter(h => h.hotelType === 'preHotel' || h.hotelType === 'postHotel').length}
                            </p>
                        </div>
                        <Calendar size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Stay Types</p>
                            <p className="font-bold text-sm text-purple-600">
                                {new Set(hotelList.flatMap(h => Object.keys(h.stayTypes || {}))).size}
                            </p>
                        </div>
                        <Hotel size={18} className="text-purple-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={expandAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <ChevronRight size={10} className="mr-1" />
                            Expand All
                        </button>
                        <button
                            onClick={collapseAll}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <ChevronLeft size={10} className="mr-1" />
                            Collapse All
                        </button>
                        <button
                            onClick={handleExportData}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <Download size={10} className="mr-1" />
                            Export Hotel Data
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                            <input
                                type="text"
                                placeholder="Search hotels or passengers..."
                                value={hotelWiseSearchTerm}
                                onChange={(e) => setHotelWiseSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredHotels.length > 0 ? (
                        filteredHotels.map((hotel) => (
                            <div key={hotel.id} className="bg-white border rounded-lg shadow overflow-hidden">
                                <div 
                                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                        hotel.hotelType === 'transit' ? 'border-l-4 border-orange-400' : 
                                        hotel.hotelType === 'preHotel' ? 'border-l-4 border-green-400' :
                                        hotel.hotelType === 'postHotel' ? 'border-l-4 border-purple-400' :
                                        'border-l-4 border-blue-400'
                                    }`}
                                    onClick={() => toggleHotelExpand(hotel.id)}
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="transform transition-transform duration-200">
                                            {expandedHotels[hotel.id] ? (
                                                <ChevronDown size={14} className="text-gray-500" />
                                            ) : (
                                                <ChevronRight size={14} className="text-gray-500" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-12 gap-2 text-[9px]">
                                            <div className="col-span-3">
                                                <div className="flex items-center">
                                                    <Hotel size={12} className="mr-1 text-blue-600" />
                                                    <span className="font-bold text-xs">{hotel.name}</span>
                                                    {hotel.rating && (
                                                        <span className="ml-1 text-yellow-500">⭐{hotel.rating}</span>
                                                    )}
                                                </div>
                                                <div className="text-[8px] text-gray-500 mt-1">
                                                    {hotel.hotelType === 'transit' ? 'Transit Hotel' : 
                                                     hotel.hotelType === 'preHotel' ? 'Pre-Hotel' :
                                                     hotel.hotelType === 'postHotel' ? 'Post-Hotel' : 
                                                     'Destination Hotel'} 
                                                    {hotel.journeyType !== 'unified' && ` • ${hotel.journeyType === 'onward' ? 'Onward' : 'Return'} Journey`}
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <div className="text-gray-500">Rooms</div>
                                                <div className="font-medium">{hotel.passengers.length}</div>
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <div className="text-gray-500">Stay Types</div>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {Object.entries(hotel.stayTypes || {}).slice(0, 2).map(([type, count]) => (
                                                        <span key={type} className={`px-1 py-0.5 rounded text-[7px] ${
                                                            type === 'lounge' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {type} ({count})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <div className="text-gray-500">Share With</div>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {Object.entries(hotel.shareWithMs || {}).slice(0, 2).map(([share, count]) => (
                                                        <span key={share} className={`px-1 py-0.5 rounded text-[7px] ${
                                                            share === 'family' ? 'bg-green-100 text-green-700' :
                                                            share === 'group' ? 'bg-orange-100 text-orange-700' : 
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {share} ({count})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-3 text-right">
                                                {hotel.address && (
                                                    <div className="text-[7px] text-gray-500 truncate" title={hotel.address}>
                                                        {hotel.address}
                                                    </div>
                                                )}
                                                {hotel.phone && (
                                                    <div className="text-[7px] text-gray-500">{hotel.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedHotels[hotel.id] && (
                                    <div className="p-3 border-t bg-gray-50">
                                        {(hotel.email || hotel.phone || hotel.address) && (
                                            <div className="mb-3 p-2 bg-white rounded border text-[8px]">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {hotel.address && (
                                                        <div className="flex items-center">
                                                            <MapPin size={8} className="mr-1 text-gray-500" />
                                                            <span>{hotel.address}</span>
                                                        </div>
                                                    )}
                                                    {hotel.phone && (
                                                        <div className="flex items-center">
                                                            <Phone size={8} className="mr-1 text-gray-500" />
                                                            <span>{hotel.phone}</span>
                                                        </div>
                                                    )}
                                                    {hotel.email && (
                                                        <div className="flex items-center">
                                                            <Mail size={8} className="mr-1 text-gray-500" />
                                                            <span className="truncate">{hotel.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-[9px]">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-2 py-1 text-left">Sr No</th>
                                                        <th className="px-2 py-1 text-left">Passenger Name</th>
                                                        <th className="px-2 py-1 text-left">Pax Code</th>
                                                        <th className="px-2 py-1 text-left">Guest Type</th>
                                                        <th className="px-2 py-1 text-left">Journey Type</th>
                                                        <th className="px-2 py-1 text-left">Hotel Type</th>
                                                        <th className="px-2 py-1 text-left">Stay Type</th>
                                                        <th className="px-2 py-1 text-left">Share with M</th>
                                                        <th className="px-2 py-1 text-left">Check-in</th>
                                                        <th className="px-2 py-1 text-left">Check-out</th>
                                                        <th className="px-2 py-1 text-left">Room No</th>
                                                        <th className="px-2 py-1 text-left">Room Type</th>
                                                        <th className="px-2 py-1 text-left">Confirmation</th>
                                                        <th className="px-2 py-1 text-left">Flight Details</th>
                                                        <th className="px-2 py-1 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {hotel.passengers.map((passenger, idx) => (
                                                        <tr key={`${passenger.id}_${idx}`} className="border-b hover:bg-white">
                                                            <td className="px-2 py-1">{idx + 1}</td>
                                                            <td className="px-2 py-1 font-medium">{passenger.fullName}</td>
                                                            <td className="px-2 py-1">
                                                                <span className="bg-gray-100 px-1 py-0.5 rounded">
                                                                    {passenger.paxCode || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.5 rounded ${
                                                                    passenger.guestType?.includes("Veg") ? "bg-green-100 text-green-800" :
                                                                    passenger.guestType?.includes("Non-Veg") ? "bg-red-100 text-red-800" :
                                                                    "bg-gray-100"
                                                                }`}>
                                                                    {passenger.guestType || "General"}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.5 rounded ${
                                                                    passenger.journeyType === 'onward' ? 'bg-blue-100 text-blue-800' :
                                                                    passenger.journeyType === 'return' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {passenger.journeyType === 'onward' ? 'Onward' : 
                                                                     passenger.journeyType === 'return' ? 'Return' : 'Unified'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.5 rounded ${
                                                                    passenger.hotelType === 'transit' ? 'bg-orange-100 text-orange-800' :
                                                                    passenger.hotelType === 'preHotel' ? 'bg-green-100 text-green-800' :
                                                                    passenger.hotelType === 'postHotel' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {passenger.hotelType === 'transit' ? 'Transit' :
                                                                     passenger.hotelType === 'preHotel' ? 'Pre' :
                                                                     passenger.hotelType === 'postHotel' ? 'Post' : 
                                                                     'Destination'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.5 rounded ${
                                                                    (passenger.stayType || 'hotel') === 'lounge' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {passenger.stayType || 'Hotel'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.5 rounded ${
                                                                    (passenger.shareWithM || 'same') === 'family' ? 'bg-green-100 text-green-800' :
                                                                    (passenger.shareWithM || 'same') === 'group' ? 'bg-orange-100 text-orange-800' : 
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {passenger.shareWithM || 'Same'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1">{passenger.checkInDate || 'N/A'}</td>
                                                            <td className="px-2 py-1">{passenger.checkOutDate || 'N/A'}</td>
                                                            <td className="px-2 py-1 font-mono">{passenger.roomNo || '-'}</td>
                                                            <td className="px-2 py-1">{passenger.roomType || '-'}</td>
                                                            <td className="px-2 py-1">
                                                                {passenger.confirmationNumber ? (
                                                                    <span className="text-green-600 text-[8px]">
                                                                        {passenger.confirmationNumber}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <div className="text-[8px]">
                                                                    {passenger.arvFlightFlightNo && (
                                                                        <div>Arr: {passenger.arvFlightFlightNo}</div>
                                                                    )}
                                                                    {passenger.depFlightFlightNo && (
                                                                        <div>Dep: {passenger.depFlightFlightNo}</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        alert(`Passenger Details:\n\n` +
                                                                              `Name: ${passenger.fullName}\n` +
                                                                              `Hotel: ${hotel.name}\n` +
                                                                              `Room: ${passenger.roomNo || 'Not assigned'}\n` +
                                                                              `Check-in: ${passenger.checkInDate || 'N/A'}\n` +
                                                                              `Check-out: ${passenger.checkOutDate || 'N/A'}\n` +
                                                                              `Stay Type: ${passenger.stayType || 'Hotel'}\n` +
                                                                              `Share With: ${passenger.shareWithM || 'Same'}\n` +
                                                                              `Confirmation: ${passenger.confirmationNumber || 'N/A'}\n` +
                                                                              `Journey: ${passenger.journeyType === 'onward' ? 'Onward' : passenger.journeyType === 'return' ? 'Return' : 'Unified'}\n` +
                                                                              `Hotel Type: ${passenger.hotelType === 'transit' ? 'Transit' : passenger.hotelType === 'preHotel' ? 'Pre' : passenger.hotelType === 'postHotel' ? 'Post' : 'Destination'}\n` +
                                                                              `Flight: ${passenger.arvFlightFlightNo || 'N/A'} → ${passenger.depFlightFlightNo || 'N/A'}`);
                                                                    }}
                                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={8} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-3 grid grid-cols-6 gap-2 text-[8px]">
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Total Rooms</div>
                                                <div className="font-bold text-sm">{hotel.passengers.length}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Occupancy Dates</div>
                                                <div className="font-bold text-sm">{Object.keys(hotel.checkIns).length}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Room Types</div>
                                                <div className="font-bold text-sm">{Object.keys(hotel.roomTypes).length}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Stay Types</div>
                                                <div className="font-bold text-sm">{Object.keys(hotel.stayTypes || {}).length}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Share With</div>
                                                <div className="font-bold text-sm">{Object.keys(hotel.shareWithMs || {}).length}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <div className="text-gray-500">Peak Date</div>
                                                <div className="font-bold text-sm">
                                                    {Object.entries(hotel.checkIns).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-8 text-center text-gray-500 rounded-lg border">
                            {hotelList.length === 0 ? (
                                <>
                                    <Hotel size={24} className="mx-auto mb-2 text-gray-400" />
                                    <p>No hotels have been assigned yet</p>
                                    <p className="text-[9px] mt-1">Assign hotels to passengers to see them grouped here</p>
                                </>
                            ) : (
                                <>
                                    <Search size={24} className="mx-auto mb-2 text-gray-400" />
                                    <p>No hotels match your search criteria</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ==================== EFFECT HOOKS ====================

    useEffect(() => {
        console.log("Component mounted with ID:", id);
        if (id) {
            fetchPnrPassengers();
            fetchAvailableHotels();
        }
    }, [id]);

    useEffect(() => {
        console.log("PNR passengers updated:", pnrPassengers.length);
        if (pnrPassengers.length > 0) {
            console.log("Processing PNR passengers...");
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

    // ==================== MAIN RETURN ====================

    const hotelGroups = {};
    const allPassengersForCount = [
        ...finalOnwardDestinations.map(p => ({ ...p, journeyType: 'onward', hotelType: 'destination' })),
        ...finalReturnDestinations.map(p => ({ ...p, journeyType: 'return', hotelType: 'destination' })),
        ...transitOnwardFlights.map(p => ({ ...p, journeyType: 'onward', hotelType: 'transit' })),
        ...transitReturnFlights.map(p => ({ ...p, journeyType: 'return', hotelType: 'transit' })),
        ...preHotelPassengers.map(p => ({ ...p, journeyType: 'unified', hotelType: 'preHotel' })),
        ...postHotelPassengers.map(p => ({ ...p, journeyType: 'unified', hotelType: 'postHotel' }))
    ];

    allPassengersForCount.forEach(passenger => {
        let hotelName = null;
        if (passenger.hotelType === 'transit') {
            hotelName = passenger.transitHotel || passenger.assignedTransitHotelName;
        } else if (passenger.hotelType === 'preHotel') {
            hotelName = passenger.preHotel || passenger.assignedPreHotelName;
        } else if (passenger.hotelType === 'postHotel') {
            hotelName = passenger.postHotel || passenger.assignedPostHotelName;
        } else {
            hotelName = passenger.hotel || passenger.assignedHotelName || passenger.pnrData?.existingHotelName;
        }
        
        if (hotelName) {
            const hotelKey = `${hotelName}_${passenger.hotelType}_${passenger.journeyType}`;
            if (!hotelGroups[hotelKey]) {
                hotelGroups[hotelKey] = true;
            }
        }
    });

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link to={`/operations/Hotel/PassengerRoomGrouping/${id}`}>
                        <h1 className="font-bold text-gray-800">Hotel Management System</h1>
                    </Link>
                    <p className="text-gray-600 text-[12px]">Manage hotel assignments for PNR passengers</p>
                </div>
                <p className='mb-0 text-[10px] flex gap-1'>
                    <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book" />
                    Learn More About The Hotel
                </p>
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
                                {pnrPassengers.reduce(
                                    (t, p) => t + (Array.isArray(p.passengers) ? p.passengers.length : 0),
                                    0
                                )}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("transitFlight");
                                setTransitDirectionTab("onward");
                                setCurrentTransitOnwardPage(0);
                                setCurrentTransitReturnPage(0);
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "transitFlight"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Hotel size={10} />
                            <span>Transit Hotel</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "transitFlight"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {transitOnwardFlights.length + transitReturnFlights.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("finalDestination");
                                setFinalDestinationDirectionTab("onward");
                                setCurrentFinalOnwardPage(0);
                                setCurrentFinalReturnPage(0);
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "finalDestination"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Navigation size={10} />
                            <span>Final Destination</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "finalDestination"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {finalOnwardDestinations.length + finalReturnDestinations.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("hotelWise");
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "hotelWise"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Building size={10} />
                            <span>Hotel Wise View</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "hotelWise"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {Object.keys(hotelGroups).length}
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
            {renderAddStayTypePopup()}
            {renderRoomImportModal()}
            {renderRoomAssignmentModal()}
            {renderBatchRoomAssignmentModal()}
            
            <div className="flex items-center justify-center h-screen bg-gray-100">
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-[40%] relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>

                            <h2 className="text-[16px] font-semibold mb-4">Upload Transit List (Download Template)</h2>
                            <p className="text-gray-600 mb-1 text-[14px]">
                                Transit Guest List 
                            </p>

                            <p className="text-[10px] mb-2">To get started, select a file. <br/>
                                Use a CSV or vCard format or our <span className="underline text-[blue]">template</span>.</p>

                            <button className="px-2 py-1 bg-blue-600 text-[10px] text-white rounded-xl hover:bg-blue-700 mb-4">
                                Select File
                            </button>

                            <p className="text-gray-600 mb-1 text-[14px] ">
                                Hotel Room No 
                            </p>

                            <p className="text-[10px] mb-2">To get started, select a file. <br/>
                                Use a CSV or vCard format or our <span className="underline text-[blue]">template</span>.</p>

                            <button className="px-2 py-1 bg-blue-600 text-[10px] text-white rounded-xl hover:bg-blue-700 mb-4">
                                Select File
                            </button>
                        </div>
                    </div>
                )}

                {isOpen2 && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-[40%] relative">
                            <button
                                onClick={() => setIsOpen2(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>

                            <h2 className="text-[16px] font-semibold mb-4">Export File & Document</h2>
                            <p className="text-gray-600 mb-1 text-[14px] flex gap-2 items-center">
                                Export the data in XLSX format, either <span className="underline text-[blue]">Hotel-wise</span> OR <span className="underline text-[blue]">Overall</span>
                                <Sheet size={15}/>
                            </p>

                            <p className="text-gray-600 mb-1 text-[14px] flex gap-2 items-center">
                                Export the document folder in either <span className="underline text-[blue]">Hotel-wise</span> or <span className="underline text-[blue]">Overall</span>  
                                <FolderDown size={15} />           
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}