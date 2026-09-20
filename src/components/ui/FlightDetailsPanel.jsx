// components/FlightDetailsPanel.jsx
import React from 'react';

const FlightDetailsPanel = ({ flight, onClose }) => {
  const formatTime = (time) => time.substring(0, 5);
  
  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'boarding': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_air': 'bg-purple-100 text-purple-800',
      'arrived': 'bg-green-100 text-green-800',
      'upcoming': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateDuration = (depDate, depTime, arvDate, arvTime) => {
    const dep = new Date(`${depDate}T${depTime}`);
    const arv = new Date(`${arvDate}T${arvTime}`);
    const durationMs = arv - dep;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Flight {flight.flight_number} Details</h2>
            <p className="text-gray-600">{flight.from_airport} → {flight.to_airport}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Status</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
              {flight.displayStatus || flight.status.replace('_', ' ')}
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Flight Progress</span>
              <span className="text-sm font-medium text-gray-900">{flight.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${flight.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Flight Route */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Route</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{flight.from_airport}</div>
                <div className="text-lg text-gray-600 mt-1">{formatTime(flight.dep_time)}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {flight.formattedDates?.dep_date || formatDisplayDate(flight.dep_date)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Terminal: {flight.dep_terminal || 'TBA'}
                </div>
              </div>

              <div className="flex-1 mx-8 text-center">
                <div className="text-gray-400 text-xl">→</div>
                <div className="text-sm text-gray-600 mt-2">
                  {calculateDuration(flight.dep_date, flight.dep_time, flight.arv_date, flight.arv_time)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Duration</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{flight.to_airport}</div>
                <div className="text-lg text-gray-600 mt-1">{formatTime(flight.arv_time)}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {flight.formattedDates?.arv_date || formatDisplayDate(flight.arv_date)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Terminal: {flight.arv_terminal || 'TBA'}
                </div>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Departure Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {flight.formattedDates?.dep_date || formatDisplayDate(flight.dep_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatTime(flight.dep_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{flight.departure_status}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Arrival Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {flight.formattedDates?.arv_date || formatDisplayDate(flight.arv_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatTime(flight.arv_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{flight.arrival_status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Journey Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Leg Order:</span>
                <span className="font-medium">{flight.leg_order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Journey ID:</span>
                <span className="font-medium">{flight.journey_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Flight Number:</span>
                <span className="font-medium">{flight.flight_number}</span>
              </div>
            </div>
          </div>

          {/* Next Action */}
          {flight.nextAction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-blue-800">Next: {flight.nextAction}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsPanel;