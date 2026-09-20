// components/FlightStatusCard.jsx
import React, { useState } from 'react';

const FlightStatusCard = ({ flight, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${getStatusColor(flight.status)} transition-all duration-200 hover:shadow-md`}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{flight.flight_number}</h3>
            <p className="text-sm text-gray-600">{flight.from_airport} → {flight.to_airport}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(flight.status)}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
              {flight.displayStatus || flight.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${flight.progress}%` }}
          ></div>
        </div>

        {/* Flight Times */}
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{formatTime(flight.dep_time)}</div>
            <div className="text-gray-600">{flight.from_airport}</div>
            <div className="text-xs text-gray-500">
              {flight.formattedDates?.dep_date || formatDisplayDate(flight.dep_date)}
            </div>
          </div>
          
          <div className="text-center mx-2">
            <div className="text-xs text-gray-500">→</div>
            <div className="text-xs text-gray-600 mt-1">
              {calculateDuration(flight.dep_date, flight.dep_time, flight.arv_date, flight.arv_time)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-gray-900">{formatTime(flight.arv_time)}</div>
            <div className="text-gray-600">{flight.to_airport}</div>
            <div className="text-xs text-gray-500">
              {flight.formattedDates?.arv_date || formatDisplayDate(flight.arv_date)}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            <svg 
              className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={onViewDetails}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Departure Date:</span>
                <span className="font-medium">
                  {flight.formattedDates?.dep_date || formatDisplayDate(flight.dep_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arrival Date:</span>
                <span className="font-medium">
                  {flight.formattedDates?.arv_date || formatDisplayDate(flight.arv_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terminal:</span>
                <span className="font-medium">
                  {flight.dep_terminal || 'TBA'} → {flight.arv_terminal || 'TBA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Journey:</span>
                <span className="font-medium">Leg {flight.leg_order}</span>
              </div>
              {flight.nextAction && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Next:</span>
                  <span className="font-medium text-blue-600">{flight.nextAction}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate duration
const calculateDuration = (depDate, depTime, arvDate, arvTime) => {
  const dep = new Date(`${depDate}T${depTime}`);
  const arv = new Date(`${arvDate}T${arvTime}`);
  const durationMs = arv - dep;
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Helper function to format date
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default FlightStatusCard;