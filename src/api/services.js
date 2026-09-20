import axios from 'axios';

const API_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api/contacts';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Get all contacts
export const getContacts = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
  }
};

// Get single contact
export const getContact = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch contact');
  }
};

// Create new contact
export const createContact = async (contactData) => {
  try {
    const response = await api.post('/', contactData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create contact');
  }
};

// Update contact
export const updateContact = async (id, contactData) => {
  try {
    const response = await api.patch(`/${id}`, contactData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update contact');
  }
};

// Delete contact
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete contact');
  }
};

// Search contacts
export const searchContacts = async (query) => {
  try {
    const response = await api.get('/search', { params: { query } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Search failed');
  }
};