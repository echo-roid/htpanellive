import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
const UPLOADS_BASE_URL = 'http://localhost:5000';

const HotelCardsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      
      if (response.data.success) {
        setRooms(response.data.data);
      } else {
        setError('Failed to fetch room data');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Error loading room data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openRoomDetails = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
    setShowModal(false);
  };

  // Group rooms by category for better organization
  const groupedRooms = rooms.reduce((acc, room) => {
    const category = room.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(room);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room configurations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRooms}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms & Suites</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our carefully curated selection of rooms and suites, each designed to provide 
            exceptional comfort and luxury for your stay.
          </p>
        </div>

        {/* Summary Stats */}
        {rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
              <div className="text-gray-600">Room Types</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {rooms.reduce((sum, room) => sum + (room.quantity || 0), 0)}
              </div>
              <div className="text-gray-600">Total Rooms</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(rooms.map(room => room.category).filter(Boolean)).size}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...rooms.map(room => room.capacity || 0))}
              </div>
              <div className="text-gray-600">Max Capacity</div>
            </div>
          </div>
        )}

        {/* Room Cards */}
        {Object.keys(groupedRooms).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedRooms).map(([category, categoryRooms]) => (
              <div key={category}>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-gray-200">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => openRoomDetails(room)}
                    >
                      {/* Room Image */}
                      <div className="relative h-48 bg-gray-200">
                        {room.roomImageUrl ? (
                          <img
                            src={`${UPLOADS_BASE_URL}${room.roomImageUrl}`}
                            alt={room.subCategory || 'Room Image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${
                            room.roomImageUrl ? 'hidden' : 'flex'
                          }`}
                        >
                          <div className="text-center text-gray-400">
                            <div className="text-4xl mb-2">🏨</div>
                            <p className="text-sm">No Image Available</p>
                          </div>
                        </div>
                        
                        {/* Room Type Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {room.subCategory || 'Room'}
                          </span>
                        </div>
                        
                        {/* Capacity Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {room.capacity || 2} Guests
                          </span>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {room.subCategory || 'Room'}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">Quantity:</span>
                            <span>{room.quantity || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">Area:</span>
                            <span>{room.area || 'N/A'} sq.ft.</span>
                          </div>
                        </div>

                        {/* Features Preview */}
                        {room.features && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {room.features}
                            </p>
                          </div>
                        )}

                        {/* View Details Button */}
                        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Rooms Available</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              There are no room configurations available at the moment. Please check back later or contact administration.
            </p>
            <button
              onClick={fetchRooms}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Room Details Modal */}
        {showModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {/* Modal Header with Image */}
                <div className="relative h-64 bg-gray-200">
                  {selectedRoom.roomImageUrl ? (
                    <img
                      src={`${UPLOADS_BASE_URL}${selectedRoom.roomImageUrl}`}
                      alt={selectedRoom.subCategory || 'Room Image'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-2">🏨</div>
                        <p className="text-lg">No Image Available</p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={closeRoomDetails}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8">
                  <div className="flex flex-wrap justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedRoom.subCategory || 'Room'}
                      </h2>
                      <p className="text-gray-600">{selectedRoom.category || 'Standard'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {selectedRoom.area || 'N/A'} sq.ft.
                      </div>
                      <div className="text-gray-600">Room Area</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{selectedRoom.quantity || 0}</div>
                      <div className="text-gray-600">Available Rooms</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{selectedRoom.capacity || 2}</div>
                      <div className="text-gray-600">Guest Capacity</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {selectedRoom.area ? Math.round(selectedRoom.area * 0.0929) : 'N/A'}
                      </div>
                      <div className="text-gray-600">Area (m²)</div>
                    </div>
                  </div>

                  {/* Features Section */}
                  {selectedRoom.features && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Features & Amenities</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedRoom.features}</p>
                    </div>
                  )}

                  {/* Remarks Section */}
                  {selectedRoom.remarks && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Additional Information</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedRoom.remarks}</p>
                    </div>
                  )}

                  {/* Hotel Image */}
                  {selectedRoom.hotelImageUrl && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Hotel View</h3>
                      <img
                        src={`${UPLOADS_BASE_URL}${selectedRoom.hotelImageUrl}`}
                        alt="Hotel View"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCardsPage;