import axios from 'axios';

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api/international-hubs';

// Get international hub data by form ID
export const getInternationalHubByFormId = async (formId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/form/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching international hub data:', error);
    throw error;
  }
};

// Save international hub data
export const saveInternationalHubData = async (lead_id,formId, hubData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, {
      
      formId,
      lead_id,
      hubData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving international hub data:', error);
    throw error;
  }
};

// Delete international hub entry
export const deleteInternationalHubEntry = async (entryId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${entryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting international hub entry:', error);
    throw error;
  }
};

// Get all international hub data
export const getAllInternationalHubData = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all international hub data:', error);
    throw error;
  }
};

export const getInternationalHubsByLeadId = async (leadId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leads/${leadId}/international-hubs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all international hub data:', error);
    throw error;
  }
};