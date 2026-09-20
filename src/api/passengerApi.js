import axios from "axios";

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';

// Helper function to transform passenger data
const transformPassengerData = (passenger) => {
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

    // Add guest fields
    Object.keys(guestData).forEach(key => {
      const value = guestData[key];
      if (value !== undefined && value !== null && value !== 'N/A') {
        transformedPassenger[`guest_${key}`] = value;
      }
    });

    // Add form fields
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== undefined && value !== null && value !== 'N/A') {
        transformedPassenger[`form_${key}`] = value;
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
};

// Fetch passengers
export const fetchPassengersData = async (leadId, page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...filters
    });

    const response = await axios.get(`${API_BASE_URL}/paxlist/lead/${leadId}?${params}`);
    
    if (response.data.success) {
      const passengers = response.data.passengers || [];
      const transformedPassengers = passengers.map(transformPassengerData);
      
      // Extract assigned PNRs and journey mappings
      const assignedPnrs = {};
      const passengerJourneys = {};
      
      transformedPassengers.forEach(passenger => {
        if (passenger.journey_id) {
          passengerJourneys[passenger.id] = passenger.journey_id;
        }
        if ((passenger.assigned_pnrs && passenger.assigned_pnrs.length > 0) || 
            (passenger.attached_pnr && passenger.attached_pnr.length > 0)) {
          assignedPnrs[passenger.paxCode] = passenger.assigned_pnrs || passenger.attached_pnr;
        }
      });

      return {
        passengers: passengers,
        transformedPassengers: transformedPassengers,
        pagination: response.data.pagination || {
          page: page,
          limit: 10,
          total: passengers.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        },
        assignedPnrs,
        passengerJourneys
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch passengers');
    }
  } catch (error) {
    console.error('Error fetching passengers:', error);
    throw error;
  }
};

// Create or update passengers from selection
export const createOrUpdatePassengersFromSelection = async (passengersData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/paxlist/pax/${passengersData.lead_id}/process-selected`, 
      passengersData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error processing selected passengers:', error);
    throw error;
  }
};

// Assign PNR to passenger
export const assignPnrToPassenger = async (leadId, paxCode, pnrNumber) => {
  try {
    const pnrData = {
      pnr_number: pnrNumber,
      assigned_by: 'Admin',
      assignment_date: new Date().toISOString()
    };

    const response = await axios.post(
      `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${paxCode}/assign-pnr`, 
      pnrData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error assigning PNR to passenger:', error);
    throw error;
  }
};

// Remove PNR from passenger
export const removePnrFromPassenger = async (leadId, paxCode, pnrNumber, removalReason = '', extraPrice = 0) => {
  try {
    const pnrData = {
      pnr_number: pnrNumber,
      removal_reason: removalReason || 'Manual removal by admin',
      extra_price: extraPrice,
      removed_by: 'Admin',
      removal_date: new Date().toISOString()
    };

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

// Bulk assign PNR to passengers
export const bulkAssignPnrToPassengers = async (leadId, bulkData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/assing-pnr/${leadId}/passengers/bulk-assign-pnr`, 
      bulkData
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk assigning PNR:', error);
    throw error;
  }
};

// Get passengers by PNR
export const getPassengersByPnr = async (pnrNumber) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assing-pnr/passengers/by-pnr/${pnrNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching passengers by PNR:', error);
    throw error;
  }
};

// Fetch journeys
export const fetchJourneys = async (leadId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flight-connections/journeys/lead/${leadId}`);
    
    if (response.data?.success) {
      const journeysData = response.data.journeys || [];
      
      const transformedJourneys = journeysData.map((journeyArray, index) => {
        const sortedConnections = (journeyArray || []).sort((a, b) => 
          (a.leg_order || 0) - (b.leg_order || 0)
        );
        
        return {
          journey_id: sortedConnections[0]?.journey_id || `journey-${index}`,
          connections: sortedConnections
        };
      });
      
      return transformedJourneys;
    } else {
      throw new Error('Failed to fetch journeys');
    }
  } catch (error) {
    console.error('Error fetching journeys:', error);
    throw error;
  }
};

// Assign journey to passenger
export const assignJourneyToPassenger = async (leadId, passengerId, journeyId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/paxlist/${passengerId}/lead/${leadId}`, 
      {
        journey_id: journeyId
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error assigning journey:', error);
    throw error;
  }
};

// Helper function to get passenger display value
export const getPassengerDisplayValue = (passenger, fieldKey) => {
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
    console.error('Error getting display value:', error, { passenger, fieldKey });
    return 'Error';
  }
};

// Helper function to render table cell
export const renderTableCell = (value) => {
  if (value === undefined || value === null || value === 'N/A') {
    return <span className="text-gray-400">N/A</span>;
  }
  
  if (typeof value === 'object' && value !== null) {
    try {
      const stringValue = JSON.stringify(value);
      return (
        <span 
          className="text-xs truncate" 
          title={stringValue}
        >
          {stringValue.length > 50 ? stringValue.substring(0, 50) + '...' : stringValue}
        </span>
      );
    } catch (error) {
      return <span className="text-xs text-red-400">Invalid data</span>;
    }
  }
  
  if (Array.isArray(value)) {
    const stringValue = value.join(', ');
    return (
      <span 
        className="text-xs truncate" 
        title={stringValue}
      >
        {stringValue.length > 50 ? stringValue.substring(0, 50) + '...' : stringValue}
      </span>
    );
  }
  
  const stringValue = String(value);
  return (
    <span 
      className="text-xs truncate" 
      title={stringValue}
    >
      {stringValue.length > 50 ? stringValue.substring(0, 50) + '...' : stringValue}
    </span>
  );
};