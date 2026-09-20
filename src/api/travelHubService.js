import axios from 'axios';

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api/travel-hubs';

// Get travel hub data by form ID
export const getTravelHubByFormId = async (formId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/form/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching travel hub data:', error);
    throw error;
  }
};

// Save travel hub data
export const saveTravelHubData = async (formId, hubData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, {
      formId,
      hubData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving travel hub data:', error);
    throw error;
  }
};

// Delete travel hub entry
export const deleteTravelHubEntry = async (entryId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${entryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting travel hub entry:', error);
    throw error;
  }
};