import React, { useState, useEffect, useRef } from 'react';
import Venueform from "./VenueForm"

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const CompactVenueTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for API data
  const [venuesData, setVenuesData] = useState([]);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  
  // Separate states for different menus
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [openActiveMenuId, setOpenActiveMenuId] = useState(null);
  
  // Refs for menus
  const actionMenuRefs = useRef({});
  const activeMenuRefs = useRef({});

  // Fetch data from API on component mount
  useEffect(() => {
    fetchVenueSpecifications();
  }, []);

  // Click outside handler to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside action menu
      if (openActionMenuId) {
        const menuElement = actionMenuRefs.current[openActionMenuId];
        if (menuElement && !menuElement.contains(event.target)) {
          setOpenActionMenuId(null);
        }
      }
      
      // Check if click is outside active menu
      if (openActiveMenuId) {
        const menuElement = activeMenuRefs.current[openActiveMenuId];
        if (menuElement && !menuElement.contains(event.target)) {
          setOpenActiveMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenuId, openActiveMenuId]);

  // Fetch venue specifications from API
  const fetchVenueSpecifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/venue-specifications`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Transform API data to match the existing table structure
        const transformedVenues = result.data.map(venue => ({
          id: venue.id,
          venueType: venue.name,
          venueCount: venue.specifications?.numberOfVenues || 1,
          capacity: venue.specifications?.seatingCapacityTheatre || 0,
          size: venue.specifications?.totalArea || 0,
          sizeUnit: venue.specifications?.areaUnit || 'sq ft',
          imagePreview: venue.specifications?.venueImages?.[0]?.image_url || 'https://via.placeholder.com/50',
          status: venue.active ? 'active' : 'maintenance',
          active: venue.active,
          price: venue.pricing?.basePrice || 0,
          seatingStyles: getSeatingStyles(venue.specifications),
          features: getFeatures(venue.specifications),
          lastUpdated: new Date(venue.updated_at || Date.now()).toISOString().split('T')[0],
          // Store full data for editing
          fullData: venue
        }));
        setVenuesData(transformedVenues);
      } else {
        // Use sample data if no API data
        setVenuesData(sampleVenues);
      }
    } catch (error) {
      console.error('Error fetching venue specifications:', error);
      // Use sample data on error
      setVenuesData(sampleVenues);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get seating styles from specifications
  const getSeatingStyles = (specs) => {
    const styles = [];
    if (specs?.theatreStyle) styles.push('Theatre');
    if (specs?.classroomSetup) styles.push('Classroom');
    if (specs?.boardroomSetup) styles.push('Boardroom');
    if (specs?.uShapeSetup) styles.push('U-Shape');
    if (specs?.roundTableSeating) styles.push('Round Table');
    if (specs?.clusterSetup) styles.push('Cluster');
    return styles.length > 0 ? styles : ['Theatre', 'Classroom', 'Banquet'];
  };

  // Helper function to get features from specifications
  const getFeatures = (specs) => {
    const features = [];
    if (specs?.centralAC) features.push('AC');
    if (specs?.soundSystem) features.push('Sound System');
    if (specs?.projectorScreen) features.push('Projector');
    if (specs?.builtInStage) features.push('Stage');
    if (specs?.inHouseCatering) features.push('Catering');
    return features.length > 0 ? features : ['AC', 'Sound System', 'Stage'];
  };

  // Sample data for fallback
  const sampleVenues = [
    {
      id: 1,
      venueType: 'Grand Ballroom',
      venueCount: 1,
      capacity: 500,
      size: 5000,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      active: true,
      price: 5000,
      seatingStyles: ['Theatre', 'Classroom', 'Banquet'],
      features: ['AC', 'Sound System', 'Stage'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      venueType: 'Garden Lawn',
      venueCount: 2,
      capacity: 300,
      size: 3000,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      active: true,
      price: 3000,
      seatingStyles: ['Standing', 'Banquet'],
      features: ['Outdoor', 'Lighting', 'Tents Available'],
      lastUpdated: '2024-01-16'
    },
    {
      id: 3,
      venueType: 'Conference Hall',
      venueCount: 3,
      capacity: 150,
      size: 2000,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      active: true,
      price: 2000,
      seatingStyles: ['Classroom', 'Boardroom', 'U-Shape'],
      features: ['Projector', 'Video Conferencing', 'Whiteboard'],
      lastUpdated: '2024-01-14'
    }
  ];

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === venuesData.length && venuesData.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(venuesData.map(item => item.id));
    }
  };

  // Handle single select
  const handleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
    setOpenActionMenuId(null); // Close action menu when opening delete modal
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete) {
        // Call API to delete venue
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/venue-specifications/${itemToDelete}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove from local state
          setVenuesData(prev => prev.filter(item => item.id !== itemToDelete));
          alert('Venue deleted successfully');
        } else {
          alert('Failed to delete venue');
        }
      } else if (selectedItems.length > 0) {
        // Bulk delete - delete each item
        setLoading(true);
        for (const id of selectedItems) {
          await fetch(`${API_BASE_URL}/venue-specifications/${id}`, {
            method: 'DELETE'
          });
        }
        // Refresh data
        await fetchVenueSpecifications();
        alert(`${selectedItems.length} venues deleted successfully`);
      }
      
      setSelectedItems([]);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Server error while deleting');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  // Handle edit
  const handleEdit = (venue) => {
    setItemToEdit(venue);
    setShowEditForm(true);
    setOpenActionMenuId(null); // Close action menu when opening edit form
  };

  // Handle update form submission
  const handleUpdateSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare payload for venue update
      const payload = {
        name: formData.venueType,
        active: formData.active !== undefined ? formData.active : itemToEdit.active,
        specifications: {
          venueName: { [formData.venueType]: formData.venueType },
          venueType: { [formData.venueType]: formData.venueType },
          totalArea: { [formData.venueType]: formData.size },
          areaUnit: { [formData.venueType]: formData.sizeUnit || 'sq ft' },
          seatingCapacityTheatre: { [formData.venueType]: formData.capacity },
          numberOfVenues: { [formData.venueType]: formData.venueCount || 1 },
          features: { [formData.venueType]: formData.features?.join(', ') || '' },
          remarks: { [formData.venueType]: formData.remarks || '' }
        },
        pricing: {
          [formData.venueType]: {
            basePrice: formData.price || 0,
            currency: 'USD',
            priceUnit: 'per event',
            taxRate: 18,
            depositRequired: false,
            refundable: true,
            minHours: 4
          }
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/venue-specifications/${itemToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        await fetchVenueSpecifications();
        alert('Venue updated successfully!');
      } else {
        alert(result.message || 'Failed to update venue');
      }

      // Close edit form
      setShowEditForm(false);
      setItemToEdit(null);
    } catch (error) {
      console.error('Error updating:', error);
      alert('Server error while updating');
    } finally {
      setLoading(false);
    }
  };

  // Handle active status toggle
  const handleToggleActive = async (venue, newActiveStatus) => {
    try {
      setLoading(true);
      
      // Prepare payload for updating active status
      const payload = {
        name: venue.venueType,
        active: newActiveStatus,
        specifications: venue.fullData?.specifications || {},
        pricing: venue.fullData?.pricing || {}
      };
      
      const response = await fetch(`${API_BASE_URL}/venue-specifications/${venue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setVenuesData(prev => prev.map(item => 
          item.id === venue.id 
            ? { ...item, active: newActiveStatus, status: newActiveStatus ? 'active' : 'maintenance' }
            : item
        ));
        alert(`Venue marked as ${newActiveStatus ? 'active' : 'inactive'}`);
      } else {
        alert(result.message || 'Failed to update venue status');
      }
      
      setOpenActiveMenuId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Server error while updating status');
    } finally {
      setLoading(false);
    }
  };

  // Handle create new item
  const handleCreateNew = () => {
    setShowCreateForm(true);
    setShowEditForm(false);
    setItemToEdit(null);
  };

  // Handle back to listing
  const handleBackToListing = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setItemToEdit(null);
    // Refresh data when coming back
    fetchVenueSpecifications();
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare payload for venue
      const payload = {
        venueTypes: [{ name: formData.venueType, active: true }],
        specifications: {
          venueName: { [formData.venueType]: formData.venueType },
          venueType: { [formData.venueType]: formData.venueType },
          totalArea: { [formData.venueType]: formData.size },
          areaUnit: { [formData.venueType]: formData.sizeUnit || 'sq ft' },
          seatingCapacityTheatre: { [formData.venueType]: formData.capacity },
          numberOfVenues: { [formData.venueType]: formData.venueCount || 1 },
          features: { [formData.venueType]: formData.features?.join(', ') || '' },
          remarks: { [formData.venueType]: formData.remarks || '' }
        },
        pricing: {
          [formData.venueType]: {
            basePrice: formData.price || 0,
            currency: 'USD',
            priceUnit: 'per event',
            taxRate: 18,
            depositRequired: false,
            refundable: true,
            minHours: 4
          }
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/venue-specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        await fetchVenueSpecifications();
        alert('Venue created successfully!');
      } else {
        alert(result.message || 'Failed to create venue');
      }

      // Go back to listing
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Server error while saving');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and status
  const getFilteredData = () => {
    let filtered = [...venuesData];
    
    if (searchTerm && venuesData.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.venueType?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'all' && venuesData.length > 0) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Toggle action menu
  const toggleActionMenu = (venueId, event) => {
    event.stopPropagation();
    setOpenActionMenuId(openActionMenuId === venueId ? null : venueId);
    // Close active menu when opening action menu
    if (openActiveMenuId) setOpenActiveMenuId(null);
  };

  // Toggle active menu
  const toggleActiveMenu = (venueId, event) => {
    event.stopPropagation();
    setOpenActiveMenuId(openActiveMenuId === venueId ? null : venueId);
    // Close action menu when opening active menu
    if (openActionMenuId) setOpenActionMenuId(null);
  };

  // Render venues table
  const renderVenuesTable = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8 px-3 py-2">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                onChange={handleSelectAll}
                className="w-3 h-3 rounded border-gray-300 text-blue-600"
              />
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Image</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Venue Type</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Venue Count</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Capacity</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Size</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Seating Styles</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Price</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Active</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Last Updated</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.map((venue) => (
            <tr key={venue.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(venue.id)}
                  onChange={() => handleSelect(venue.id)}
                  className="w-3 h-3 rounded border-gray-300 text-blue-600"
                />
              </td>
              <td className="px-3 py-2">
                <img 
                  src={venue.imagePreview} 
                  alt={venue.venueType}
                  className="w-8 h-8 rounded object-cover"
                />
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-900 font-medium">{venue.venueType}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{venue.venueCount}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{venue.capacity} guests</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{venue.size} {venue.sizeUnit}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">
                <div className="flex gap-1 flex-wrap">
                  {venue.seatingStyles?.map((style, idx) => (
                    <span key={idx} className="px-1 bg-gray-100 rounded text-[8px]">{style}</span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-600">${venue.price}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-medium
                  ${venue.status === 'active' ? 'bg-green-100 text-green-800' : 
                    venue.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {venue.status}
                </span>
              </td>
              <td className="px-3 py-2 relative">
                <div ref={el => activeMenuRefs.current[venue.id] = el}>
                  <button
                    onClick={(e) => toggleActiveMenu(venue.id, e)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[8px] hover:bg-gray-200 flex items-center gap-1"
                  >
                    {venue.active ? 'Active ✓' : 'Inactive ✗'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Active Status Dropdown Menu */}
                  {openActiveMenuId === venue.id && (
                    <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <button
                        onClick={() => handleToggleActive(venue, true)}
                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Set Active
                      </button>
                      <button
                        onClick={() => handleToggleActive(venue, false)}
                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Set Inactive
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{venue.lastUpdated}</td>
              <td className="px-3 py-2 relative">
                <div ref={el => actionMenuRefs.current[venue.id] = el}>
                  {/* 3-dot menu button */}
                  <button
                    onClick={(e) => toggleActionMenu(venue.id, e)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Actions"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu for Edit/Delete */}
                  {openActionMenuId === venue.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleEdit(venue)}
                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(venue.id)}
                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[10px] text-gray-500">No venues found</p>
        </div>
      )}
    </div>
  );

  const renderDeleteModal = () => {
    if (!showDeleteConfirm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Confirm Delete</h3>
          <p className="text-[10px] text-gray-600 mb-4">
            Are you sure you want to delete {itemToDelete ? 'this item' : `${selectedItems.length} items`}? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setItemToDelete(null);
              }}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-3 py-1.5 bg-red-500 text-white rounded text-[10px] font-medium hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add search and filter bar
  const renderSearchAndFilter = () => (
    <div className="mb-4 flex gap-4 items-center">
      <input
        type="text"
        placeholder="Search venues..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-3 py-1.5 text-[10px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-1.5 text-[10px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="maintenance">Maintenance</option>
      </select>
      
      {selectedItems.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="px-3 py-1.5 bg-red-500 text-white rounded text-[10px] font-medium hover:bg-red-600 whitespace-nowrap"
        >
          Delete Selected ({selectedItems.length})
        </button>
      )}
    </div>
  );

  // Render create form with back button
  const renderCreateForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-800">
          Create New Venue
        </h2>
        <button
          onClick={handleBackToListing}
          className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
        >
          ← Back to Listing
        </button>
      </div>
      <Venueform 
        onSubmit={handleFormSubmit}
        onCancel={handleBackToListing}
      />
    </div>
  );

  // Render edit form
  const renderEditForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-800">
          Edit Venue: {itemToEdit?.venueType}
        </h2>
        <button
          onClick={handleBackToListing}
          className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
        >
          ← Back to Listing
        </button>
      </div>
      <Venueform 
        onSubmit={handleUpdateSubmit}
        onCancel={handleBackToListing}
        initialData={{
          venueType: itemToEdit?.venueType,
          venueCount: itemToEdit?.venueCount,
          capacity: itemToEdit?.capacity,
          size: itemToEdit?.size,
          sizeUnit: itemToEdit?.sizeUnit,
          price: itemToEdit?.price,
          features: itemToEdit?.features,
          active: itemToEdit?.active
        }}
      />
    </div>
  );

  return (
    <div className="bg-gray-100">
      <div className="max-w-full mx-auto p-4">
        {/* Conditionally show either the listing, create form, or edit form */}
        {!showCreateForm && !showEditForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              {renderSearchAndFilter()}
              <button
                onClick={handleCreateNew}
                className="px-4 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 whitespace-nowrap ml-4"
              >
                + Create New Venue
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-[10px] text-gray-500">Loading venues...</p>
              </div>
            ) : (
              renderVenuesTable()
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[8px] text-gray-500">
                Showing {filteredData.length} of {venuesData.length} items
              </p>
              <div className="flex gap-1">
                <button className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50">Previous</button>
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-[8px]">1</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50">2</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50">3</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50">Next</button>
              </div>
            </div>
          </>
        ) : showCreateForm ? (
          renderCreateForm()
        ) : (
          renderEditForm()
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default CompactVenueTable;