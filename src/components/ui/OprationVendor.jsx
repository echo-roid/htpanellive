import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import bookImage  from "../../assets/book.png"

const VendorSelection = () => {
  const { id: leadId } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [operationVendors, setOperationVendors] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'selected'

  // Fetch vendors from main vendors table
  const fetchVendors = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/vendors', {
        params: { page, limit: 10, search }
      });
      
      if (response.data.success) {
        setVendors(response.data.data);
        setPagination(response.data.pagination);
        
        // Check which vendors are already added to operation_vendors for this lead
        checkExistingVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch already selected operation vendors for this lead
  const fetchOperationVendors = async () => {
    try {
      const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/Operation/operation-vendors/lead/${leadId}`);
      if (response.data.success) {
        setOperationVendors(response.data.data);
        
        // Mark vendors that are already added
        const selectedMap = {};
        response.data.data.forEach(opVendor => {
          // Find matching vendor by email or other unique identifier
          const matchingVendor = vendors.find(v => v.email === opVendor.email);
          if (matchingVendor) {
            selectedMap[matchingVendor.id] = {
              checked: true,
              operationVendorId: opVendor.id,
              data: opVendor
            };
          }
        });
        setSelectedVendors(selectedMap);
      }
    } catch (error) {
      console.error('Error fetching operation vendors:', error);
    }
  };

  // Check which vendors are already in operation_vendors
  const checkExistingVendors = async (vendorsList) => {
    try {
      const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/Operation/operation-vendors/lead/${leadId}`);
      if (response.data.success) {
        const operationVendorsList = response.data.data;
        setOperationVendors(operationVendorsList);
        
        const selectedMap = {};
        operationVendorsList.forEach(opVendor => {
          // Match by email (you can change this to match by another field if needed)
          const matchingVendor = vendorsList.find(v => v.email === opVendor.email);
          if (matchingVendor) {
            selectedMap[matchingVendor.id] = {
              checked: true,
              operationVendorId: opVendor.id,
              data: opVendor
            };
          }
        });
        setSelectedVendors(selectedMap);
      }
    } catch (error) {
      console.error('Error checking existing vendors:', error);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchVendors();
    }
  }, [leadId]);

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (leadId) {
        fetchVendors(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, leadId]);

  // Handle checkbox change
  const handleVendorSelect = async (vendor, checked) => {
    if (checked) {
      // Add to operation vendors
      await addToOperationVendors(vendor);
    } else {
      // Remove from operation vendors
      const selectedVendor = selectedVendors[vendor.id];
      if (selectedVendor?.operationVendorId) {
        await removeFromOperationVendors(selectedVendor.operationVendorId, vendor.id);
      }
    }
  };

  // Add vendor to operation_vendors table
  const addToOperationVendors = async (vendor) => {
    setSubmitting(prev => ({ ...prev, [vendor.id]: true }));
    
    try {
      // Prepare the vendor data with lead_id
      const operationVendorData = {
        ...vendor,
        lead_id: leadId,
        // Remove id and vendor_id as they will be auto-generated
        id: undefined,
        vendor_id: undefined
      };

      const response = await axios.post(
        'https://tableware-dweeb-estate.ngrok-free.dev/api/Operation/operation-vendors',
        operationVendorData
      );

      if (response.data.success) {
        // Update selected vendors state
        setSelectedVendors(prev => ({
          ...prev,
          [vendor.id]: {
            checked: true,
            operationVendorId: response.data.data.id,
            data: response.data.data
          }
        }));

        // Refresh operation vendors list
        fetchOperationVendors();

        // Show success message
        alert(`Vendor "${vendor.vendor_name}" added successfully to operation vendors`);
      }
    } catch (error) {
      console.error('Error adding vendor to operation vendors:', error);
      alert(error.response?.data?.message || 'Failed to add vendor to operation vendors');
      
      // Uncheck the checkbox if failed
      setSelectedVendors(prev => ({
        ...prev,
        [vendor.id]: { ...prev[vendor.id], checked: false }
      }));
    } finally {
      setSubmitting(prev => ({ ...prev, [vendor.id]: false }));
    }
  };

  // Remove vendor from operation_vendors table
  const removeFromOperationVendors = async (operationVendorId, vendorId) => {
    if (!window.confirm('Are you sure you want to remove this vendor from operation vendors?')) {
      // Revert checkbox state
      setSelectedVendors(prev => ({
        ...prev,
        [vendorId]: { ...prev[vendorId], checked: true }
      }));
      return;
    }

    setSubmitting(prev => ({ ...prev, [vendorId]: true }));
    
    try {
      const response = await axios.delete(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/Operation/operation-vendors/${operationVendorId}`
      );

      if (response.data.success) {
        // Remove from selected vendors
        setSelectedVendors(prev => {
          const newState = { ...prev };
          delete newState[vendorId];
          return newState;
        });

        // Refresh operation vendors list
        fetchOperationVendors();

        alert('Vendor removed successfully from operation vendors');
      }
    } catch (error) {
      console.error('Error removing vendor from operation vendors:', error);
      alert('Failed to remove vendor from operation vendors');
      
      // Revert checkbox state
      setSelectedVendors(prev => ({
        ...prev,
        [vendorId]: { ...prev[vendorId], checked: true }
      }));
    } finally {
      setSubmitting(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchVendors(newPage, searchTerm);
  };

  // Handle vendor click to navigate to BillinVendor page
  const handleVendorClick = (vendorId) => {
    navigate(`/operations/BillinVendor/${vendorId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

        <div className='flex justify-between'>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Vendor Selection for Lead: <span className="text-blue-600">{leadId}</span>
      </h2>
             <p className='mb-0 text-[10px] flex gap-1'>
                <img src={bookImage} className='mt-0 w-[15px] mb-4 h-[15px]'/>
                Learn More About The Cabs
             </p>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === 'available' 
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('available')}
        >
          Available Vendors ({vendors.length})
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === 'selected' 
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('selected')}
        >
          Selected Vendors ({operationVendors.length})
        </button>
      </div>

      {/* Search Bar (only for available tab) */}
      {activeTab === 'available' && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vendors by name, email, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Available Vendors Tab */}
      {activeTab === 'available' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading vendors...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedVendors[vendor.id]?.checked || false}
                              onChange={(e) => handleVendorSelect(vendor, e.target.checked)}
                              disabled={submitting[vendor.id]}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            {submitting[vendor.id] && (
                              <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vendor.vendor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor.business_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor.contact_person}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor.vendor_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${vendor.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              vendor.status?.toLowerCase() === 'occupied' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {vendor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(pagination.pages)].map((_, i) => {
                          const pageNumber = i + 1;
                          // Show first page, last page, and pages around current page
                          if (
                            pageNumber === 1 ||
                            pageNumber === pagination.pages ||
                            (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                  ${pagination.page === pageNumber 
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === pagination.page - 2 ||
                            pageNumber === pagination.page + 2
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Selected Vendors Tab */}
      {activeTab === 'selected' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {operationVendors.length === 0 ? (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors selected</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by selecting vendors from the available tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operationVendors.map(vendor => (
                    <tr 
                      key={vendor.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.vendor_name}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-gray-700"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.business_name}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-gray-700"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.email}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-gray-700"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.phone}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-gray-700"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.contact_person}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-gray-700"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        {vendor.vendor_type}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => handleVendorClick(vendor.id)}
                      >
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${vendor.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            vendor.status?.toLowerCase() === 'occupied' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking remove button
                            // Find original vendor id to update state
                            const originalVendor = vendors.find(v => v.email === vendor.email);
                            if (originalVendor) {
                              removeFromOperationVendors(vendor.id, originalVendor.id);
                            } else {
                              // If no matching vendor found in the vendors list, just use the operation vendor id
                              removeFromOperationVendors(vendor.id, null);
                            }
                          }}
                          disabled={submitting[vendor.id]}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                          {submitting[vendor.id] ? (
                            <>
                              <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Removing...
                            </>
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSelection;