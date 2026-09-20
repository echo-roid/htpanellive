import React, { useState, useEffect } from 'react';
import HotelSpecificationsForm from './HotelSpecificationsForm'; // Import the form component

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const CompactHotelTable = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Fetch hotels from API
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/hotel-specifications`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Transform API data to match table structure
        const transformedHotels = result.data.map(hotel => ({
          id: hotel.id,
          hotelName: hotel.name,
          hotelCode: hotel.specifications?.hotelCode || '',
          totalRooms: hotel.specifications?.totalRooms || 0,
          totalVenues: 0,
          location: hotel.specifications?.city || '',
          city: hotel.specifications?.city || '',
          imagePreview: hotel.specifications?.hotelImages?.[0]?.image_url || 'https://via.placeholder.com/50',
          status: hotel.active ? 'active' : 'maintenance',
          rating: hotel.specifications?.starRating ? parseInt(hotel.specifications.starRating) : 0,
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          lastUpdated: new Date(hotel.updated_at || Date.now()).toISOString().split('T')[0],
          basePrice: hotel.pricing?.basePrice || 0,
          currency: hotel.pricing?.currency || 'USD',
          fullData: hotel
        }));
        setHotels(transformedHotels);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      alert('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const currentPageData = getCurrentPageData();
    if (selectedItems.length === currentPageData.length && currentPageData.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentPageData.map(item => item.id));
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
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      if (itemToDelete) {
        // Delete single hotel
        const response = await fetch(`${API_BASE_URL}/hotel-specifications/${itemToDelete}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchHotels();
          alert('Hotel deleted successfully');
        } else {
          alert('Failed to delete hotel');
        }
      } else if (selectedItems.length > 0) {
        // Bulk delete
        for (const id of selectedItems) {
          await fetch(`${API_BASE_URL}/hotel-specifications/${id}`, {
            method: 'DELETE'
          });
        }
        await fetchHotels();
        alert(`${selectedItems.length} hotels deleted successfully`);
      }
      
      setSelectedItems([]);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setCurrentPage(1);
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

  // Handle create new hotel
  const handleCreateNew = () => {
    setEditingHotel(null);
    setShowCreateForm(true);
  };

  // Handle edit hotel
  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setShowCreateForm(true);
  };

  // Handle back to listing
  const handleBackToListing = () => {
    setShowCreateForm(false);
    setEditingHotel(null);
    fetchHotels(); // Refresh data when coming back
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare payload for API
      const payload = {
        hotelTypes: [{ name: formData.hotelName, active: true }],
        specifications: {
          hotelName: { [formData.hotelName]: formData.hotelName },
          hotelCode: { [formData.hotelName]: formData.hotelCode },
          shortDescription: { [formData.hotelName]: formData.shortDescription },
          longDescription: { [formData.hotelName]: formData.longDescription },
          starRating: { [formData.hotelName]: formData.starRating },
          propertyType: { [formData.hotelName]: formData.propertyType },
          brandName: { [formData.hotelName]: formData.brandName },
          yearBuilt: { [formData.hotelName]: formData.yearBuilt },
          yearRenovated: { [formData.hotelName]: formData.yearRenovated },
          address: { [formData.hotelName]: formData.address },
          city: { [formData.hotelName]: formData.city },
          state: { [formData.hotelName]: formData.state },
          country: { [formData.hotelName]: formData.country },
          pinCode: { [formData.hotelName]: formData.pinCode },
          latitude: { [formData.hotelName]: formData.latitude },
          longitude: { [formData.hotelName]: formData.longitude },
          airportDistance: { [formData.hotelName]: formData.airportDistance },
          railwayDistance: { [formData.hotelName]: formData.railwayDistance },
          metroStation: { [formData.hotelName]: formData.metroStation },
          touristAttractions: { [formData.hotelName]: formData.touristAttractions },
          frontDesk24x7: { [formData.hotelName]: formData.frontDesk24x7 },
          elevator: { [formData.hotelName]: formData.elevator },
          luggageStorage: { [formData.hotelName]: formData.luggageStorage },
          powerBackup: { [formData.hotelName]: formData.powerBackup },
          atmCurrencyExchange: { [formData.hotelName]: formData.atmCurrencyExchange },
          swimmingPool: { [formData.hotelName]: formData.swimmingPool },
          spaWellness: { [formData.hotelName]: formData.spaWellness },
          gym: { [formData.hotelName]: formData.gym },
          gardenLawn: { [formData.hotelName]: formData.gardenLawn },
          kidsPlayArea: { [formData.hotelName]: formData.kidsPlayArea },
          totalRooms: { [formData.hotelName]: formData.totalRooms },
          roomTypesDeluxe: { [formData.hotelName]: formData.roomTypesDeluxe },
          roomTypesStandard: { [formData.hotelName]: formData.roomTypesStandard },
          roomTypesSuite: { [formData.hotelName]: formData.roomTypesSuite },
          roomTypesFamily: { [formData.hotelName]: formData.roomTypesFamily },
          roomSize: { [formData.hotelName]: formData.roomSize },
          roomSizeUnit: { [formData.hotelName]: formData.roomSizeUnit },
          bedType: { [formData.hotelName]: formData.bedType },
          occupancy: { [formData.hotelName]: formData.occupancy },
          roomAmenities: { [formData.hotelName]: formData.roomAmenities },
          restaurantInhouse: { [formData.hotelName]: formData.restaurantInhouse },
          cuisineTypes: { [formData.hotelName]: formData.cuisineTypes },
          barLounge: { [formData.hotelName]: formData.barLounge },
          breakfastAvailable: { [formData.hotelName]: formData.breakfastAvailable },
          roomService: { [formData.hotelName]: formData.roomService },
          housekeeping: { [formData.hotelName]: formData.housekeeping },
          laundryService: { [formData.hotelName]: formData.laundryService },
          concierge: { [formData.hotelName]: formData.concierge },
          wakeupCall: { [formData.hotelName]: formData.wakeupCall },
          airportTransfer: { [formData.hotelName]: formData.airportTransfer },
          carRental: { [formData.hotelName]: formData.carRental },
          conferenceRooms: { [formData.hotelName]: formData.conferenceRooms },
          banquetHall: { [formData.hotelName]: formData.banquetHall },
          meetingRooms: { [formData.hotelName]: formData.meetingRooms },
          projectorAV: { [formData.hotelName]: formData.projectorAV },
          eventManagement: { [formData.hotelName]: formData.eventManagement },
          cctvSurveillance: { [formData.hotelName]: formData.cctvSurveillance },
          securityGuards: { [formData.hotelName]: formData.securityGuards },
          fireSafety: { [formData.hotelName]: formData.fireSafety },
          smokeDetectors: { [formData.hotelName]: formData.smokeDetectors },
          firstAid: { [formData.hotelName]: formData.firstAid },
          freeWifi: { [formData.hotelName]: formData.freeWifi },
          internetSpeed: { [formData.hotelName]: formData.internetSpeed },
          businessCenterInternet: { [formData.hotelName]: formData.businessCenterInternet },
          freeParking: { [formData.hotelName]: formData.freeParking },
          paidParking: { [formData.hotelName]: formData.paidParking },
          valetParking: { [formData.hotelName]: formData.valetParking },
          evCharging: { [formData.hotelName]: formData.evCharging },
          shuttleService: { [formData.hotelName]: formData.shuttleService },
          checkInTime: { [formData.hotelName]: formData.checkInTime },
          checkOutTime: { [formData.hotelName]: formData.checkOutTime },
          cancellationPolicy: { [formData.hotelName]: formData.cancellationPolicy },
          childPolicy: { [formData.hotelName]: formData.childPolicy },
          petPolicy: { [formData.hotelName]: formData.petPolicy },
          idProofRequired: { [formData.hotelName]: formData.idProofRequired },
          cash: { [formData.hotelName]: formData.cash },
          creditCard: { [formData.hotelName]: formData.creditCard },
          upi: { [formData.hotelName]: formData.upi },
          netBanking: { [formData.hotelName]: formData.netBanking },
          wallets: { [formData.hotelName]: formData.wallets },
          overallRating: { [formData.hotelName]: formData.overallRating },
          reviewCount: { [formData.hotelName]: formData.reviewCount },
          guestReviews: { [formData.hotelName]: formData.guestReviews },
          cleanlinessRating: { [formData.hotelName]: formData.cleanlinessRating },
          locationRating: { [formData.hotelName]: formData.locationRating },
          serviceRating: { [formData.hotelName]: formData.serviceRating },
          valueForMoneyRating: { [formData.hotelName]: formData.valueForMoneyRating },
          wheelchairAccess: { [formData.hotelName]: formData.wheelchairAccess },
          elevatorAccess: { [formData.hotelName]: formData.elevatorAccess },
          accessibleRooms: { [formData.hotelName]: formData.accessibleRooms },
          accessibleWashrooms: { [formData.hotelName]: formData.accessibleWashrooms },
          coupleFriendly: { [formData.hotelName]: formData.coupleFriendly },
          familyFriendly: { [formData.hotelName]: formData.familyFriendly },
          businessFriendly: { [formData.hotelName]: formData.businessFriendly },
          luxuryStay: { [formData.hotelName]: formData.luxuryStay },
          budgetStay: { [formData.hotelName]: formData.budgetStay },
          features: { [formData.hotelName]: formData.features },
          remarks: { [formData.hotelName]: formData.remarks }
        },
        pricing: {
          [formData.hotelName]: {
            basePrice: formData.basePrice || 0,
            currency: formData.currency || 'USD',
            priceUnit: formData.priceUnit || 'per night',
            taxRate: formData.taxRate || null,
            taxType: formData.taxType || null,
            discountPercent: formData.discountPercent || null,
            weekendRate: formData.weekendRate || null,
            peakSeasonRate: formData.peakSeasonRate || null,
            securityDeposit: formData.securityDeposit || null,
            cleaningFee: formData.cleaningFee || null,
            extraPersonCharge: formData.extraPersonCharge || null,
            breakfastPrice: formData.breakfastPrice || null,
            refundable: formData.refundable !== undefined ? formData.refundable : true,
            minStay: formData.minStay || 1,
            maxStay: formData.maxStay || null
          }
        },
        billingFeatures: {
          billingEnabled: formData.billingEnabled !== undefined ? formData.billingEnabled : true,
          taxEnabled: formData.taxEnabled !== undefined ? formData.taxEnabled : true,
          discountEnabled: formData.discountEnabled || false,
          weekendRateEnabled: formData.weekendRateEnabled || false,
          peakSeasonRateEnabled: formData.peakSeasonRateEnabled || false,
          securityDepositEnabled: formData.securityDepositEnabled !== undefined ? formData.securityDepositEnabled : true,
          cleaningFeeEnabled: formData.cleaningFeeEnabled !== undefined ? formData.cleaningFeeEnabled : true,
          extraPersonChargeEnabled: formData.extraPersonChargeEnabled || false,
          breakfastIncludedEnabled: formData.breakfastIncludedEnabled || false,
          cancellationPolicyEnabled: formData.cancellationPolicyEnabled !== undefined ? formData.cancellationPolicyEnabled : true,
          minMaxStayEnabled: formData.minMaxStayEnabled || false
        }
      };
      
      const url = editingHotel 
        ? `${API_BASE_URL}/hotel-specifications/${editingHotel.id}`
        : `${API_BASE_URL}/hotel-specifications`;
      
      const method = editingHotel ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchHotels(); // Refresh the list
        alert(`Hotel ${editingHotel ? 'updated' : 'created'} successfully!`);
        setShowCreateForm(false);
        setEditingHotel(null);
      } else {
        alert(result.message || `Failed to ${editingHotel ? 'update' : 'create'} hotel`);
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Server error while saving hotel');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and status
  const getFilteredData = () => {
    let filtered = [...hotels];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.hotelName?.toLowerCase().includes(searchLower) ||
        hotel.city?.toLowerCase().includes(searchLower) ||
        hotel.hotelCode?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hotel => hotel.status === statusFilter);
    }
    
    return filtered;
  };

  // Get current page data
  const getCurrentPageData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const filteredData = getFilteredData();
  const currentPageData = getCurrentPageData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  // Render hotels table
  const renderHotelsTable = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8 px-3 py-2">
              <input
                type="checkbox"
                checked={selectedItems.length === currentPageData.length && currentPageData.length > 0}
                onChange={handleSelectAll}
                className="w-3 h-3 rounded border-gray-300 text-blue-600"
              />
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Image</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Hotel Name</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Hotel Code</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Total Rooms</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Location</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">City</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Rating</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Base Price</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Last Updated</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentPageData.map((hotel) => (
            <tr key={hotel.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(hotel.id)}
                  onChange={() => handleSelect(hotel.id)}
                  className="w-3 h-3 rounded border-gray-300 text-blue-600"
                />
              </td>
              <td className="px-3 py-2">
                <img 
                  src={hotel.imagePreview} 
                  alt={hotel.hotelName}
                  className="w-8 h-8 rounded object-cover"
                />
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-900 font-medium">{hotel.hotelName}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.hotelCode || 'N/A'}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.totalRooms || 0}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.location || 'N/A'}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.city || 'N/A'}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">
                {hotel.rating ? '⭐'.repeat(hotel.rating) : 'N/A'}
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-600">
                {hotel.basePrice ? `${hotel.currency} ${hotel.basePrice}` : 'N/A'}
              </td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-medium
                  ${hotel.status === 'active' ? 'bg-green-100 text-green-800' : 
                    hotel.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {hotel.status}
                </span>
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.lastUpdated}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(hotel)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[8px] hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(hotel.id)}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-[8px] hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[10px] text-gray-500">No hotels found</p>
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
            Are you sure you want to delete {itemToDelete ? 'this hotel' : `${selectedItems.length} hotels`}? 
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

  // Search and filter bar
  const renderSearchAndFilter = () => (
    <div className="mb-4 flex gap-4 items-center">
      <input
        type="text"
        placeholder="Search hotels by name, city, or code..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="px-3 py-1.5 text-[10px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
      />
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
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

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[8px] text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} items
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-2 py-1 border rounded text-[8px] ${
                  currentPage === pageNum
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-gray-300 rounded text-[8px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Render create form
  const renderCreateForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-800">
          {editingHotel ? 'Edit Hotel' : 'Create New Hotel'}
        </h2>
        <button
          onClick={handleBackToListing}
          className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
        >
          ← Back to Listing
        </button>
      </div>
      <HotelSpecificationsForm 
        onSubmit={handleFormSubmit}
        onCancel={handleBackToListing}
        initialData={editingHotel?.fullData}
      />
    </div>
  );

  return (
    <div className=" min-h-screen">
      <div className="max-w-full mx-auto p-4">

        {/* Conditionally show either listing or form */}
        {!showCreateForm ? (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4">
              {renderSearchAndFilter()}
              <button
                onClick={handleCreateNew}
                className="px-4 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 whitespace-nowrap ml-4"
              >
                + Create New Hotel
              </button>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-[10px] text-gray-500">Loading hotels...</p>
              </div>
            ) : (
              renderHotelsTable()
            )}
            
            {/* Pagination */}
            {!loading && filteredData.length > 0 && renderPagination()}
          </>
        ) : (
          renderCreateForm()
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default CompactHotelTable;