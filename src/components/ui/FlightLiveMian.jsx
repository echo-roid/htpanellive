// App.js
import React, { useState } from 'react';
import FlightDashboard from './FlightDashboard';
import { useParams } from 'react-router-dom';

function FlightLiveMian() {
  const { id: leadId } = useParams();
 

  return (
    <div className="App">
      <FlightDashboard leadId={leadId} />
    </div>
  );
}

export default FlightLiveMian;