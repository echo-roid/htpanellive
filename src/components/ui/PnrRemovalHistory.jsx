// PnrRemovalHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PnrRemovalHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const leadIdFromUrl = id || '';

  const [removals, setRemovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    leadId: leadIdFromUrl,
    pnr_number: '',
    pax_code: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  });

  const fetchRemovals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchParams.leadId) params.append('leadId', searchParams.leadId);
      if (searchParams.pnr_number) params.append('pnr_number', searchParams.pnr_number);
      if (searchParams.pax_code) params.append('pax_code', searchParams.pax_code);
      params.append('page', searchParams.page);
      params.append('limit', searchParams.limit);

      const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/assing-pnr/pnr-removals?${params.toString()}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setRemovals(response.data.data);
        setPagination({
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          limit: response.data.pagination.limit
        });
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error details:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        setError('No response from server. Please check if the server is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadIdFromUrl) {
      setSearchParams(prev => ({ ...prev, leadId: leadIdFromUrl }));
    }
    fetchRemovals();
  }, [leadIdFromUrl]);

  useEffect(() => {
    if (searchParams.page !== 1 || searchParams.limit !== 10) {
      fetchRemovals();
    }
  }, [searchParams.page, searchParams.limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, page: 1 }));
    if (leadIdFromUrl) {
      setSearchParams(prev => ({ ...prev, leadId: leadIdFromUrl }));
    }
    fetchRemovals();
  };

  const handleReset = () => {
    setSearchParams({
      leadId: leadIdFromUrl,
      pnr_number: '',
      pax_code: '',
      page: 1,
      limit: 10,
    });
    setTimeout(() => fetchRemovals(), 100);
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setSearchParams(prev => ({ 
      ...prev, 
      limit: parseInt(e.target.value),
      page: 1 
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    const num = parseFloat(amount);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getPassengerName = (removal) => {
    if (removal.passenger_details?.form_data?.full_name) {
      return removal.passenger_details.form_data.full_name;
    }
    if (removal.passenger_details?.form_data?.email) {
      return removal.passenger_details.form_data.email.split('@')[0] || 'N/A';
    }
    return 'N/A';
  };

  const getPassengerEmail = (removal) => {
    return removal.passenger_details?.form_data?.email?.trim() || 'N/A';
  };

  const getPassengerPhone = (removal) => {
    return removal.passenger_details?.form_data?.phone || 'N/A';
  };

  const getPnrType = (removal) => {
    return removal.pnr_details?.pnr_type || 'N/A';
  };

  const getChairType = (removal) => {
    return removal.pnr_details?.chair_type || 'N/A';
  };

  const getPnrStatus = (removal) => {
    return removal.pnr_details?.status || 'N/A';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Active': 'bg-green-100 text-green-800',
      'Removed': 'bg-red-100 text-red-800',
      'N/A': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors['N/A'];
  };

  const getPaginationItems = () => {
    const items = [];
    const totalPages = pagination.pages;
    const currentPage = pagination.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (currentPage > 3) items.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) items.push('...');
      items.push(totalPages);
    }
    
    return items;
  };

  const getLeadDisplay = (leadId) => {
    if (!leadId) return 'N/A';
    return (
      <span 
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-800 cursor-pointer hover:bg-indigo-200"
        onClick={() => navigate(`/lead/${leadId}`)}
      >
        {leadId}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-[11px] font-bold text-gray-800">PNR Removal History</h1>
              {leadIdFromUrl && (
                <p className="text-[11px] text-gray-500">
                  Lead ID: <span className="font-semibold text-indigo-600">{leadIdFromUrl}</span>
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-[11px] text-gray-600">Total Records:</span>
              <span className="font-bold text-[11px] text-indigo-600">{pagination.total}</span>
            </div>
            <button
              onClick={fetchRemovals}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">Lead ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  name="leadId"
                  value={searchParams.leadId}
                  onChange={handleInputChange}
                  placeholder="Enter Lead ID"
                  className={`w-full pl-10 pr-3 py-2 text-[11px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    leadIdFromUrl ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  readOnly={!!leadIdFromUrl}
                  disabled={!!leadIdFromUrl}
                />
              </div>
              {leadIdFromUrl && (
                <p className="mt-1 text-[11px] text-gray-500">Lead ID is locked from URL</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">PNR Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  name="pnr_number"
                  value={searchParams.pnr_number}
                  onChange={handleInputChange}
                  placeholder="Enter PNR Number"
                  className="w-full pl-10 pr-3 py-2 text-[11px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">Pax Code</label>
              <input
                type="text"
                name="pax_code"
                value={searchParams.pax_code}
                onChange={handleInputChange}
                placeholder="Enter Pax Code"
                className="w-full px-3 py-2 text-[11px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">Items Per Page</label>
              <select
                value={searchParams.limit}
                onChange={handleLimitChange}
                className="w-full px-3 py-2 text-[11px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-[11px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center px-6 py-2 text-[11px] bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-[11px] text-red-700">{error}</p>
              <button
                onClick={fetchRemovals}
                className="mt-2 text-[11px] text-red-700 font-medium underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Lead ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">PNR Number</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Pax Code</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Passenger</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Extra Price</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">PNR Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Chair</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-white uppercase tracking-wider">Removed At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-[11px] text-gray-500">Loading PNR removal history...</p>
                    </div>
                  </td>
                </tr>
              ) : removals.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-[11px] text-gray-500">No PNR removal records found</p>
                      <p className="text-[11px] text-gray-400">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                removals.map((removal) => (
                  <tr key={removal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-900">
                      #{removal.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getLeadDisplay(removal.lead_id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-[11px] text-indigo-600">
                        {removal.pnr_number || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-gray-600">
                      {removal.pax_code || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-gray-900">
                          {getPassengerName(removal)}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {removal.pax_code || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-gray-600">
                      {getPassengerEmail(removal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                        {formatCurrency(removal.extra_price)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                        {getPnrType(removal)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-gray-600">
                      {getChairType(removal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(getPnrStatus(removal))}`}>
                        {getPnrStatus(removal)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>{formatDate(removal.removed_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[11px] text-gray-700">
                Showing <span className="font-medium">{removals.length}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> records
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {getPaginationItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={() => typeof item === 'number' && handlePageChange(item)}
                      disabled={item === '...' || item === pagination.currentPage}
                      className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                        item === pagination.currentPage
                          ? 'bg-indigo-600 text-white'
                          : item === '...'
                          ? 'text-gray-500 cursor-default'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="px-3 py-1 rounded border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {!loading && removals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-600">Total Removals</p>
                <p className="text-[11px] font-bold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-600">Total Extra Price</p>
                <p className="text-[11px] font-bold text-gray-900">
                  {formatCurrency(removals.reduce((sum, r) => sum + parseFloat(r.extra_price || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-600">Current Page</p>
                <p className="text-[11px] font-bold text-gray-900">
                  {pagination.currentPage} / {pagination.pages}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-600">Pending Records</p>
                <p className="text-[11px] font-bold text-gray-900">
                  {removals.filter(r => r.pnr_details?.status === 'Pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PnrRemovalHistory;