// components/LiveUpdates.jsx
import React from 'react';

const LiveUpdates = ({ data }) => {
  const getStatusColor = (status) => {
    const colors = {
      'boarding': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_air': 'bg-purple-100 text-purple-800 border-purple-200',
      'arrived': 'bg-green-100 text-green-800 border-green-200',
      'upcoming': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'boarding': '🚀',
      'scheduled': '⏰',
      'in_air': '✈️',
      'arrived': '✅',
      'upcoming': '📅'
    };
    return icons[status] || '📋';
  };

  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <h2 className="text-lg font-semibold text-gray-900">Live Updates</h2>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Active: {data.activeFlights}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upcoming: {data.upcomingDepartures}
          </span>
        </div>
      </div>

      {data.flights.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No active flights for today
        </div>
      ) : (
        <div className="space-y-3">
          {data.flights.map(flight => (
            <div
              key={flight.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                flight.isActive 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              } transition-colors duration-200`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(flight.status)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gray-900">{flight.flight_number}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                        {flight.displayStatus || flight.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.from_airport} → {flight.to_airport}
                    </div>
                    <div className="text-xs text-gray-500">
                      Dep: {formatDisplayDate(flight.dep_date)} | Arr: {formatDisplayDate(flight.arv_date)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{flight.message}</div>
                {flight.nextAction && (
                  <div className="text-xs text-blue-600 mt-1">{flight.nextAction}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Dep: {formatTime(flight.dep_time)} | Arr: {formatTime(flight.arv_time)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default LiveUpdates;