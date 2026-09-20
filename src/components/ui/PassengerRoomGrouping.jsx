import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HotelGroupingView = ({ leadId = 13 }) => {
  const [hotelGroups, setHotelGroups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [sortBy, setSortBy] = useState('hotel_name');

  useEffect(() => {
    fetchHotelGroups();
  }, [leadId]);

  const fetchHotelGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/hotels/lead/${leadId}/hotel-groups`);
      
      if (response.data.success) {
        setHotelGroups(response.data.data);
        setStatistics(response.data.statistics);
        console.log('Hotel groups data:', response.data);
      } else {
        setError(response.data.message || 'Failed to fetch hotel groups');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching hotel groups');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  const toggleRoomExpansion = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'checked_in':
      case 'checked in':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getRoomTypeColor = (roomType) => {
    switch (roomType?.toLowerCase()) {
      case 'single':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'double':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'triple':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getFamilyBadgeColor = (isFamily) => {
    return isFamily 
      ? 'bg-purple-100 text-purple-800 border border-purple-300' 
      : 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const filteredGroups = hotelGroups.filter(group => {
    if (viewMode === 'family') {
      return group.room_assignments?.some(room => room.is_family_group);
    }
    if (viewMode === 'individual') {
      return group.room_assignments?.every(room => !room.is_family_group);
    }
    return true;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'hotel_name':
        return a.hotel.localeCompare(b.hotel);
      case 'check_in':
        return new Date(a.check_in) - new Date(b.check_in);
      case 'passenger_count':
        return b.total_passengers - a.total_passengers;
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading hotel groups...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <button
              onClick={fetchHotelGroups}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      {statistics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hotel Room Assignments</h2>
              <p className="text-gray-600 mt-1">Lead ID: {leadId} • {statistics.total_groups} hotel groups • {statistics.total_passengers} passengers</p>
            </div>
            <button
              onClick={fetchHotelGroups}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-900">Total Rooms</p>
                  <p className="text-2xl font-bold text-blue-700">{statistics.total_rooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-900">Total Passengers</p>
                  <p className="text-2xl font-bold text-purple-700">{statistics.total_passengers}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-900">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-green-700">{statistics.occupancy_rate}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-900">Efficiency Score</p>
                  <p className="text-2xl font-bold text-yellow-700">{statistics.efficiency_score}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'all' ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                >
                  All Groups
                </button>
                <button
                  onClick={() => setViewMode('family')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'family' ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                >
                  Family Rooms
                </button>
                <button
                  onClick={() => setViewMode('individual')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'individual' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                >
                  Individual Rooms
                </button>
              </div>
            </div>

            {/* <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              >
                <option value="hotel_name">Hotel Name</option>
                <option value="check_in">Check-in Date</option>
                <option value="passenger_count">Group Size</option>
                <option value="status">Status</option>
              </select>
            </div> */}
          </div>
        </div>
      )}

      {/* Hotel Groups List */}
      <div className="space-y-4">
        {sortedGroups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hotel groups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode !== 'all' ? `No ${viewMode} groups available.` : 'No hotel assignments found for this lead.'}
            </p>
            <button
              onClick={fetchHotelGroups}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          sortedGroups.map((group) => (
            <div key={group.group_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Group Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{group.hotel}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(group.status)}`}>
                        {group.status || 'Unknown Status'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                        {group.total_rooms} Room{group.total_rooms !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-medium text-gray-900">{formatDate(group.check_in)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-medium text-gray-900">{formatDate(group.check_out)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Passengers</p>
                          <p className="font-medium text-gray-900">{group.total_passengers} person{group.total_passengers !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1115.5 21M12 12v.01" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Arrival Date</p>
                          <p className="font-medium text-gray-900">{formatDate(group.arrival_date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {group.confirmation && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">Confirmation #:</span>
                          <span className="ml-2 font-semibold text-gray-900">{group.confirmation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleGroupExpansion(group.group_id)}
                    className="ml-4 flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${expandedGroup === group.group_id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Rooms Details (Expanded) */}
              {expandedGroup === group.group_id && (
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Room Assignments ({group.total_rooms} rooms, {group.total_passengers} passengers)
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                      Occupancy: {group.occupancy_rate}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {group.room_assignments.map((room, roomIndex) => (
                      <div key={room.room_id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{room.room_id}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomTypeColor(room.room_type)}`}>
                              {room.room_type} Room
                            </span>
                            {room.is_family_group && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                                Family Room
                              </span>
                            )}
                            {room.family_code !== 'MIXED' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                Family: {room.family_code}
                              </span>
                            )}
                            <span className="text-xs text-gray-600 font-medium">
                              {room.occupancy} • {room.passenger_count} passenger{room.passenger_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleRoomExpansion(room.room_id)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className={`h-4 w-4 text-gray-400 transition-transform ${expandedRoom === room.room_id ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        {expandedRoom === room.room_id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center">
                              <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                              Passenger Details
                            </h5>
                            <div className="space-y-3">
                              {room.passengers.map((passenger, passengerIndex) => (
                                <div key={`${room.room_id}_${passengerIndex}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                                        <span className="text-blue-700 text-sm font-semibold">
                                          {passenger.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                      <h6 className="text-sm font-semibold text-gray-900">
                                        {passenger.name}
                                      </h6>
                                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Name Field */}
                                        <div className="bg-white rounded p-3 border border-gray-200">
                                          <div className="flex items-center">
                                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                              <p className="text-xs text-gray-500 font-medium">Name</p>
                                              <p className="text-sm font-medium text-gray-900 mt-1">{passenger.name}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Email Field */}
                                        <div className="bg-white rounded p-3 border border-gray-200">
                                          <div className="flex items-center">
                                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                              <p className="text-xs text-gray-500 font-medium">Email</p>
                                              <p className="text-sm text-gray-700 mt-1 truncate">
                                                {passenger.email || 'Not available'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Phone Field */}
                                        <div className="bg-white rounded p-3 border border-gray-200">
                                          <div className="flex items-center">
                                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <div>
                                              <p className="text-xs text-gray-500 font-medium">Phone</p>
                                              <p className="text-sm text-gray-700 mt-1">
                                                {passenger.phone || 'Not available'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Fc Code Field - Full width if available */}
                                        {passenger.family_code && (
                                          <div className="md:col-span-3 bg-purple-50 rounded p-3 border border-purple-200">
                                            <div className="flex items-center">
                                              <svg className="h-4 w-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                              </svg>
                                              <div>
                                                <p className="text-xs text-purple-600 font-medium">Family Code (Fc Code)</p>
                                                <p className="text-sm font-semibold text-purple-700 mt-1">
                                                  {passenger.family_code}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detailed Statistics Section */}
  
    </div>
  );
};

export default HotelGroupingView;