// components/FlightDashboard.jsx
import React, { useState, useEffect } from 'react';
import FlightStatusCard from './FlightStatusCard';
import StatsOverview from './StatsOverview';
import LiveUpdates from './LiveUpdates';
import FlightDetailsPanel from './FlightDetailsPanel';

const FlightDashboard = ({ leadId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/flight-status/dashboard/${leadId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.dashboard);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/flight-status/live-updates/${leadId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLiveUpdates(result.liveUpdates);
      }
    } catch (err) {
      console.error('Live updates fetch error:', err);
    }
  };

  const handleViewDetails = (flight) => {
    setSelectedFlight(flight);
    setShowDetailsPanel(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsPanel(false);
    setSelectedFlight(null);
  };

  useEffect(() => {
    if (leadId) {
      fetchDashboardData();
      fetchLiveUpdates();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchLiveUpdates();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [leadId]);

  const handleRefresh = () => {
    fetchDashboardData();
    fetchLiveUpdates();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading flight data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Error: {error}</span>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flight Dashboard</h1>
            <p className="text-gray-600">Real-time flight status and updates</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        {dashboardData && (
          <StatsOverview stats={dashboardData.stats} />
        )}

        {/* Live Updates */}
        {liveUpdates && liveUpdates.flights.length > 0 && (
          <LiveUpdates data={liveUpdates} />
        )}

        {/* Flight Sections */}
        {dashboardData && (
          <div className="space-y-6">
            {/* In Air - NEW SECTION */}
            {dashboardData.flights.inAir && dashboardData.flights.inAir.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Currently In Air</h2>
                  <span className="ml-2 bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                    {dashboardData.flights.inAir.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.flights.inAir.map(flight => (
                    <FlightStatusCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDetails={() => handleViewDetails(flight)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Departing Today */}
            {dashboardData.flights.departingToday.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Departing Today</h2>
                  <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                    {dashboardData.flights.departingToday.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.flights.departingToday.map(flight => (
                    <FlightStatusCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDetails={() => handleViewDetails(flight)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Arriving Today */}
            {dashboardData.flights.arrivingToday.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Arriving Today</h2>
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {dashboardData.flights.arrivingToday.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.flights.arrivingToday.map(flight => (
                    <FlightStatusCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDetails={() => handleViewDetails(flight)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Arrived */}
            {dashboardData.flights.arrived.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Arrived</h2>
                  <span className="ml-2 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                    {dashboardData.flights.arrived.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.flights.arrived.map(flight => (
                    <FlightStatusCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDetails={() => handleViewDetails(flight)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {dashboardData.flights.upcoming.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Flights</h2>
                  <span className="ml-2 bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                    {dashboardData.flights.upcoming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.flights.upcoming.map(flight => (
                    <FlightStatusCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDetails={() => handleViewDetails(flight)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {Object.values(dashboardData.flights).every(arr => arr.length === 0) && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-600">No flights are scheduled for the next few days.</p>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {/* Flight Details Panel */}
        {showDetailsPanel && selectedFlight && (
          <FlightDetailsPanel 
            flight={selectedFlight}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
};

export default FlightDashboard;