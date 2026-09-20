import axios from 'axios';

export default {
  fetchAttendance: async (params = {}) => {
    try {
      const response = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  checkIn: async (data) => {
    try {
      const response = await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/check-in', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },

  checkOut: async (data) => {
    try {
      const response = await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/check-out', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  },
};