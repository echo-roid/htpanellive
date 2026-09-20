import axios from 'axios';

const API_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api/companies';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Get all companies
export const getCompanies = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch companies');
  }
};

// Get single company
export const getCompany = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch company');
  }
};

// Create new company
export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/', companyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create company');
  }
};

// Update company
export const updateCompany = async (id, companyData) => {
  try {
    const response = await api.patch(`/${id}`, companyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update company');
  }
};

// Delete company
export const deleteCompany = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete company');
  }
};

// Search companies
export const searchCompanies = async (query) => {
  try {
    const response = await api.get('/search', { params: { query } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Search failed');
  }
};