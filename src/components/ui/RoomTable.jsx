import React, { useState, useEffect } from 'react';
import Roomform from "./RoomForm"

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const CompactRoomTable = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for API data
  const [roomsData, setRoomsData] = useState([]);
  const [venuesData, setVenuesData] = useState([]);
  const [hotelsData, setHotelsData] = useState([]);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch data from API on component mount
  useEffect(() => {
    fetchRoomSpecifications();
    // You can add similar fetch for venues and hotels if needed
  }, []);

  // Fetch room specifications from API
  const fetchRoomSpecifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/rooms/room-specifications`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Transform API data to match the existing table structure
        const transformedRooms = result.data.map(room => ({
          id: room.id,
          roomType: room.name,
          roomCount: room.specifications?.quantity || 0,
          capacity: room.specifications?.maximumOccupancy || 0,
          size: room.specifications?.roomSize || 0,
          sizeUnit: room.specifications?.roomSizeUnit || 'sq ft',
          imagePreview: room.specifications?.roomImages?.[0]?.url || 'https://via.placeholder.com/50',
          status: room.active ? 'active' : 'maintenance',
          price: room.specifications?.pricing?.basePrice || 0,
          amenities: room.specifications?.amenities || [],
          floor: room.specifications?.floorLevel || '',
          bedType: room.specifications?.bedType || '',
          lastUpdated: new Date(room.updated_at || Date.now()).toISOString().split('T')[0]
        }));
        setRoomsData(transformedRooms);
      } else {
        // Fallback to sample data if no API data
        setRoomsData(sampleRooms);
      }
    } catch (error) {
      console.error('Error fetching room specifications:', error);
      // Use sample data on error
      setRoomsData(sampleRooms);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for fallback
  const sampleRooms = [
    {
      id: 1,
      roomType: 'Deluxe Room',
      roomCount: 25,
      capacity: 2,
      size: 350,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      price: 299,
      amenities: ['TV', 'AC', 'WiFi'],
      floor: '2-5',
      bedType: 'King',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      roomType: 'Royal Room',
      roomCount: 15,
      capacity: 3,
      size: 500,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      price: 499,
      amenities: ['TV', 'AC', 'WiFi', 'Mini Bar'],
      floor: '6-8',
      bedType: 'King',
      lastUpdated: '2024-01-16'
    },
    {
      id: 3,
      roomType: 'Suite Room',
      roomCount: 10,
      capacity: 4,
      size: 750,
      sizeUnit: 'sq ft',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'maintenance',
      price: 799,
      amenities: ['TV', 'AC', 'WiFi', 'Jacuzzi', 'Living Room'],
      floor: '9-10',
      bedType: 'California King',
      lastUpdated: '2024-01-14'
    }
  ];

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
      price: 2000,
      seatingStyles: ['Classroom', 'Boardroom', 'U-Shape'],
      features: ['Projector', 'Video Conferencing', 'Whiteboard'],
      lastUpdated: '2024-01-14'
    }
  ];

  const sampleHotels = [
    {
      id: 1,
      hotelName: 'Grand Hyatt',
      hotelCode: 'GH001',
      totalRooms: 150,
      totalVenues: 3,
      location: 'Downtown',
      city: 'New York',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      rating: 5,
      contactPerson: 'John Doe',
      contactEmail: 'john@hyatt.com',
      contactPhone: '+1 234 567 890',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      hotelName: 'Marriott',
      hotelCode: 'MR002',
      totalRooms: 200,
      totalVenues: 5,
      location: 'Business Bay',
      city: 'Dubai',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'active',
      rating: 5,
      contactPerson: 'Jane Smith',
      contactEmail: 'jane@marriott.com',
      contactPhone: '+971 234 567 890',
      lastUpdated: '2024-01-16'
    },
    {
      id: 3,
      hotelName: 'Hilton Garden Inn',
      hotelCode: 'HI003',
      totalRooms: 120,
      totalVenues: 2,
      location: 'Airport Area',
      city: 'London',
      imagePreview: 'https://via.placeholder.com/50',
      status: 'maintenance',
      rating: 4,
      contactPerson: 'Mike Johnson',
      contactEmail: 'mike@hilton.com',
      contactPhone: '+44 234 567 890',
      lastUpdated: '2024-01-14'
    }
  ];

  // Get current data based on active tab
  const getCurrentData = () => {
    switch(activeTab) {
      case 'rooms':
        return roomsData;
      case 'venues':
        return venuesData;
      case 'hotels':
        return hotelsData;
      default:
        return [];
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const currentData = getCurrentData();
    if (selectedItems.length === currentData.length && currentData.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item.id));
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
      if (activeTab === 'rooms' && itemToDelete) {
        // Call API to delete room
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/room-specifications/${itemToDelete}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove from local state
          setRoomsData(prev => prev.filter(item => item.id !== itemToDelete));
          alert('Room deleted successfully');
        } else {
          alert('Failed to delete room');
        }
      } else if (selectedItems.length > 0 && activeTab === 'rooms') {
        // Bulk delete - delete each item
        setLoading(true);
        for (const id of selectedItems) {
          await fetch(`${API_BASE_URL}/room-specifications/${id}`, {
            method: 'DELETE'
          });
        }
        // Refresh data
        await fetchRoomSpecifications();
        alert(`${selectedItems.length} rooms deleted successfully`);
      } else if (activeTab === 'venues') {
        // For venues, just update local state
        setVenuesData(prev => prev.filter(item => 
          itemToDelete ? item.id !== itemToDelete : !selectedItems.includes(item.id)
        ));
      } else if (activeTab === 'hotels') {
        // For hotels, just update local state
        setHotelsData(prev => prev.filter(item => 
          itemToDelete ? item.id !== itemToDelete : !selectedItems.includes(item.id)
        ));
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

  // Handle create new item
  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  // Handle back to listing
  const handleBackToListing = () => {
    setShowCreateForm(false);
    // Refresh data when coming back
    if (activeTab === 'rooms') {
      fetchRoomSpecifications();
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (activeTab === 'rooms') {
        // Save to API
        const payload = {
          roomTypes: [{ name: formData.roomType, active: true }],
          specifications: {
            roomSize: { [formData.roomType]: formData.size },
            roomSizeUnit: { [formData.roomType]: formData.sizeUnit },
            bedType: { [formData.roomType]: formData.bedType },
            maximumOccupancy: { [formData.roomType]: formData.capacity },
            floorLevel: { [formData.roomType]: formData.floor },
            amenities: { [formData.roomType]: formData.amenities || [] },
            features: { [formData.roomType]: formData.features || '' },
            remarks: { [formData.roomType]: formData.remarks || '' }
          },
          billingEnabled: true,
          billingFeatures: {}
        };
        
        const response = await fetch(`${API_BASE_URL}/room-specifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh data
          await fetchRoomSpecifications();
          alert('Room created successfully!');
        } else {
          alert(result.message || 'Failed to create room');
        }
      } else {
        // For venues and hotels, add to local state
        const newItem = {
          id: Date.now(),
          ...formData,
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        if (activeTab === 'venues') {
          setVenuesData(prev => [...prev, newItem]);
        } else if (activeTab === 'hotels') {
          setHotelsData(prev => [...prev, newItem]);
        }
        alert(`${activeTab.slice(0, -1)} created successfully!`);
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
    const data = getCurrentData();
    
    let filtered = [...data];
    
    if (searchTerm && data.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        if (activeTab === 'rooms') {
          return (item.roomType?.toLowerCase().includes(searchLower) ||
                 item.bedType?.toLowerCase().includes(searchLower));
        } else if (activeTab === 'venues') {
          return item.venueType?.toLowerCase().includes(searchLower);
        } else if (activeTab === 'hotels') {
          return (item.hotelName?.toLowerCase().includes(searchLower) ||
                 item.city?.toLowerCase().includes(searchLower) ||
                 item.hotelCode?.toLowerCase().includes(searchLower));
        }
        return false;
      });
    }
    
    if (statusFilter !== 'all' && data.length > 0) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Render different tables based on active tab
  const renderTable = () => {
    if (loading) {
      return <div className="text-center py-8 text-[10px] text-gray-500">Loading...</div>;
    }
    
    if (getCurrentData().length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-[10px] text-gray-500">No data available for {activeTab}</p>
          <button
            onClick={handleCreateNew}
            className="mt-2 px-3 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600"
          >
            Create New {activeTab.slice(0, -1)}
          </button>
        </div>
      );
    }

    switch(activeTab) {
      case 'rooms':
        return renderRoomsTable();
      case 'venues':
        return renderVenuesTable();
      case 'hotels':
        return renderHotelsTable();
      default:
        return <div className="text-center py-8 text-[10px] text-gray-500">Select a valid tab</div>;
    }
  };

  const renderRoomsTable = () => (
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
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Room Type</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Room Count</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Capacity</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Size</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Bed Type</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Price</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Last Updated</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.map((room) => (
            <tr key={room.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(room.id)}
                  onChange={() => handleSelect(room.id)}
                  className="w-3 h-3 rounded border-gray-300 text-blue-600"
                />
              </td>
              <td className="px-3 py-2">
                <img 
                  src={room.imagePreview} 
                  alt={room.roomType}
                  className="w-8 h-8 rounded object-cover"
                />
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-900 font-medium">{room.roomType}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{room.roomCount}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{room.capacity} guests</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{room.size} {room.sizeUnit}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{room.bedType}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">${room.price}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-medium
                  ${room.status === 'active' ? 'bg-green-100 text-green-800' : 
                    room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {room.status}
                </span>
              </td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{room.lastUpdated}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[8px] hover:bg-blue-200">Edit</button>
                  <button 
                    onClick={() => handleDelete(room.id)}
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
          <p className="text-[10px] text-gray-500">No rooms found</p>
        </div>
      )}
    </div>
  );

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
              <td className="px-3 py-2 text-[10px] text-gray-600">{venue.lastUpdated}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[8px] hover:bg-blue-200">Edit</button>
                  <button 
                    onClick={() => handleDelete(venue.id)}
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
          <p className="text-[10px] text-gray-500">No venues found</p>
        </div>
      )}
    </div>
  );

  const renderHotelsTable = () => (
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
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Hotel Name</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Hotel Code</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Rooms</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Venues</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Location</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">City</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Rating</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Last Updated</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.map((hotel) => (
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
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.hotelCode}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.totalRooms}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.totalVenues}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.location}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{hotel.city}</td>
              <td className="px-3 py-2 text-[10px] text-gray-600">{'⭐'.repeat(hotel.rating)}</td>
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
                  <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[8px] hover:bg-blue-200">Edit</button>
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
        placeholder={`Search ${activeTab}...`}
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
          Create New {activeTab.slice(0, -1)}
        </h2>
        <button
          onClick={handleBackToListing}
          className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
        >
          ← Back to Listing
        </button>
      </div>
      <Roomform 
        onSubmit={handleFormSubmit}
        onCancel={handleBackToListing}
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {/* Conditionally show either the listing or the create form */}
          {!showCreateForm ? (
            <>
              <div className="flex justify-between items-center mb-4">
                {renderSearchAndFilter()}
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 whitespace-nowrap ml-4"
                >
                  + Create New {activeTab.slice(0, -1)}
                </button>
              </div>
              {renderTable()}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[8px] text-gray-500">
                  Showing {filteredData.length} of {getCurrentData().length} items
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
          ) : (
            renderCreateForm()
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default CompactRoomTable;