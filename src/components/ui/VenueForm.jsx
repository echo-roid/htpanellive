import React, { useState } from 'react';

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const VenueSpecificationsForm = ({ onSubmit, onCancel }) => {
  const [venueTypes, setVenueTypes] = useState([
    { id: 1, name: 'Grand Ballroom1', active: true },
    { id: 2, name: 'Garden Lawn1', active: true },
    { id: 3, name: 'Conference Hall1', active: true }
  ]);

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [bulkImages, setBulkImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get default values for a new venue
  const getDefaultVenueValues = () => {
    return {
      venueName: '',
      venueType: '',
      totalArea: '',
      areaUnit: 'sq ft',
      seatingCapacityTheatre: '',
      seatingCapacityClassroom: '',
      seatingCapacityUShape: '',
      floatingCapacity: '',
      numberOfVenues: '',
      
      // Seating & Layout
      theatreStyle: false,
      roundTableSeating: false,
      classroomSetup: false,
      boardroomSetup: false,
      uShapeSetup: false,
      clusterSetup: false,
      customLayout: false,
      
      // Climate
      centralAC: false,
      outdoorCooling: false,
      ventilationSystem: false,
      airPurifiers: false,
      backupPower: false,
      
      // AV Equipment
      microphones: false,
      microphoneType: '',
      soundSystem: false,
      projectorScreen: false,
      ledWall: false,
      stageLighting: '',
      djSetup: false,
      videoConferencing: false,
      liveStreaming: false,
      
      // Stage
      builtInStage: false,
      customStage: false,
      eventDecoration: false,
      floralDecoration: false,
      themeDecoration: false,
      ledLighting: false,
      entryGateDecoration: false,
      
      // Catering
      inHouseCatering: false,
      multiCuisineMenu: false,
      buffetSetup: false,
      liveCounters: false,
      barService: false,
      outsideCatering: 'no',
      kitchenFacility: false,
      
      // Washrooms
      separateWashrooms: false,
      accessibleWashrooms: false,
      babyChangingStation: false,
      sanitizationFacilities: false,
      housekeepingStaff: false,
      
      // Parking
      parkingCapacityCars: '',
      parkingCapacityBuses: '',
      valetParking: false,
      evCharging: false,
      shuttleService: false,
      nearbyTransport: false,
      
      // Security
      cctvSurveillance: false,
      securityGuards: false,
      fireSafety: false,
      emergencyExits: false,
      metalDetectors: false,
      
      // Connectivity
      highSpeedWifi: false,
      lanConnectivity: false,
      chargingPoints: false,
      eventManagementSoftware: false,
      digitalSignage: false,
      
      // Support
      eventManager: false,
      weddingPlanner: false,
      technicalSupport: false,
      registrationDesk: false,
      guestAssistance: false,
      
      // Accommodation
      guestRoomsAvailable: '',
      bridalRoom: false,
      vipSuites: false,
      changingRooms: false,
      
      // Outdoor
      gardenArea: false,
      poolsideVenue: false,
      rooftopVenue: false,
      scenicViews: false,
      fireworksAllowed: false,
      
      // Accessibility
      wheelchairAccess: false,
      elevators: false,
      rampAccess: false,
      accessibleWashroomsVenue: false,
      
      // Premium
      luxuryLounge: false,
      vipEntry: false,
      privateButler: false,
      helicopterLanding: false,
      premiumDecor: false,
      celebrityPerformance: false,
      
      // Pricing
      basePrice: '',
      currency: 'USD',
      priceUnit: 'per event',
      taxRate: '18',
      taxType: 'gst',
      discountPercent: '',
      weekendRate: '',
      peakSeasonRate: '',
      extraHourCharge: '',
      depositRequired: false,
      depositAmount: '',
      refundable: true,
      cancellationPolicy: 'flexible',
      minHours: '4',
      maxHours: '',
      
      // Images & Additional
      venueImages: [],
      features: '',
      remarks: ''
    };
  };

  // Initialize form data for all venues
  const initializeFormData = (venues) => {
    const defaultValues = getDefaultVenueValues();
    const initialData = {};
    
    // Get all field names from defaultValues
    const fieldNames = Object.keys(defaultValues);
    
    // Initialize each field as an empty object
    fieldNames.forEach(field => {
      initialData[field] = {};
    });
    
    // Populate with existing venues
    venues.forEach(venue => {
      fieldNames.forEach(field => {
        // Set default values for each field
        if (field === 'venueImages') {
          initialData[field][venue.name] = [];
        } else if (field === 'currency') {
          initialData[field][venue.name] = 'USD';
        } else if (field === 'areaUnit') {
          initialData[field][venue.name] = 'sq ft';
        } else if (field === 'priceUnit') {
          initialData[field][venue.name] = 'per event';
        } else if (field === 'taxRate') {
          initialData[field][venue.name] = '18';
        } else if (field === 'taxType') {
          initialData[field][venue.name] = 'gst';
        } else if (field === 'cancellationPolicy') {
          initialData[field][venue.name] = 'flexible';
        } else if (field === 'minHours') {
          initialData[field][venue.name] = '4';
        } else if (field === 'refundable') {
          initialData[field][venue.name] = true;
        } else if (field === 'outsideCatering') {
          initialData[field][venue.name] = 'no';
        } else if (field === 'venueName') {
          initialData[field][venue.name] = venue.name;
        } else if (typeof defaultValues[field] === 'boolean') {
          initialData[field][venue.name] = false;
        } else if (typeof defaultValues[field] === 'number') {
          initialData[field][venue.name] = '';
        } else {
          initialData[field][venue.name] = '';
        }
      });
    });
    
    return initialData;
  };

  // Form data state for multiple venues
  const [formData, setFormData] = useState(() => initializeFormData(venueTypes));

  // Options
  const venueTypeOptions = ['Indoor Hall', 'Outdoor Lawn', 'Rooftop', 'Poolside', 'Ballroom', 'Banquet Hall', 'Conference Room'];
  const microphoneTypeOptions = ['Cordless', 'Collar', 'Handheld', 'Lavalier', 'Headset'];
  const stageLightingOptions = ['Basic', 'Advanced', 'Professional', 'LED', 'Moving Head', 'None'];
  const outsideCateringOptions = ['yes', 'no', 'with approval'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'];
  const priceUnitOptions = ['per event', 'per hour', 'per day', 'per person'];
  const taxTypeOptions = ['gst', 'vat', 'sales tax', 'service tax', 'no tax'];
  const cancellationOptions = ['flexible', 'moderate', 'strict', 'non-refundable'];

  // Handle input changes
  const handleInputChange = (venueName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [venueName]: value
      }
    }));
  };

  const handleCheckboxChange = (venueName, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [venueName]: !prev[field][venueName]
      }
    }));
  };

  const handleImageUpload = (venueName, files) => {
    const imageArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      venueImages: {
        ...prev.venueImages,
        [venueName]: [...(prev.venueImages[venueName] || []), ...imageArray]
      }
    }));
  };

  const handleRemoveImage = (venueName, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      venueImages: {
        ...prev.venueImages,
        [venueName]: prev.venueImages[venueName].filter((_, idx) => idx !== imageIndex)
      }
    }));
  };

  const handleBulkImageUpload = (files) => {
    setBulkImages(Array.from(files));
  };

  const assignBulkImages = () => {
    const selectedVenues = Array.from(document.querySelectorAll('input[name="bulk-venue-select"]:checked'))
      .map(checkbox => checkbox.value);
    
    if (selectedVenues.length === 0) {
      alert('Please select at least one venue to assign images');
      return;
    }
    
    const imageArray = bulkImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    const updatedFormData = { ...formData };
    selectedVenues.forEach(venueName => {
      updatedFormData.venueImages[venueName] = [
        ...(updatedFormData.venueImages[venueName] || []),
        ...imageArray
      ];
    });
    
    setFormData(updatedFormData);
    setShowBulkImageModal(false);
    setBulkImages([]);
    alert(`Assigned ${bulkImages.length} images to ${selectedVenues.length} venue(s)`);
  };

  const openAddVenueModal = () => {
    setNewVenueName('');
    setShowAddVenueModal(true);
  };

  const addNewVenueType = () => {
    if (!newVenueName.trim()) {
      alert('Please enter a venue name');
      return;
    }

    const venueName = newVenueName.trim();
    
    // Check if venue name already exists
    if (venueTypes.some(v => v.name === venueName)) {
      alert('Venue name already exists!');
      return;
    }
    
    // Add new venue to venueTypes
    const newVenue = { id: Date.now(), name: venueName, active: true };
    const updatedVenueTypes = [...venueTypes, newVenue];
    setVenueTypes(updatedVenueTypes);
    
    // Get default values for the new venue
    const defaultValues = getDefaultVenueValues();
    
    // Update form data for all venues
    setFormData(prev => {
      const newFormData = { ...prev };
      
      // Get all field names
      const fieldNames = Object.keys(defaultValues);
      
      // For each field, add the new venue with default values
      fieldNames.forEach(field => {
        if (!newFormData[field]) {
          newFormData[field] = {};
        }
        
        // Set default value based on field type
        if (field === 'venueImages') {
          newFormData[field][venueName] = [];
        } else if (field === 'currency') {
          newFormData[field][venueName] = 'USD';
        } else if (field === 'areaUnit') {
          newFormData[field][venueName] = 'sq ft';
        } else if (field === 'priceUnit') {
          newFormData[field][venueName] = 'per event';
        } else if (field === 'taxRate') {
          newFormData[field][venueName] = '18';
        } else if (field === 'taxType') {
          newFormData[field][venueName] = 'gst';
        } else if (field === 'cancellationPolicy') {
          newFormData[field][venueName] = 'flexible';
        } else if (field === 'minHours') {
          newFormData[field][venueName] = '4';
        } else if (field === 'refundable') {
          newFormData[field][venueName] = true;
        } else if (field === 'outsideCatering') {
          newFormData[field][venueName] = 'no';
        } else if (field === 'venueName') {
          newFormData[field][venueName] = venueName;
        } else if (typeof defaultValues[field] === 'boolean') {
          newFormData[field][venueName] = false;
        } else {
          newFormData[field][venueName] = '';
        }
      });
      
      return newFormData;
    });

    setShowAddVenueModal(false);
    setNewVenueName('');
  };

  const removeVenueType = (venueId, venueName) => {
    if (venueTypes.length <= 1) {
      alert('You need at least one venue type');
      return;
    }
    
    setVenueTypes(venueTypes.filter(v => v.id !== venueId));
    
    setFormData(prev => {
      const newFormData = { ...prev };
      Object.keys(prev).forEach(field => {
        if (typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
          delete newFormData[field][venueName];
        }
      });
      return newFormData;
    });
  };

  // Save all venue specifications
  const handleSaveAllVenues = async () => {
    try {
      setLoading(true);
      
      // Prepare payload
      const payload = {
        venueTypes: venueTypes.map(vt => ({ name: vt.name, active: vt.active })),
        specifications: formData,
        pricing: {}
      };
      
      // Add pricing for each venue
      venueTypes.forEach(venue => {
        payload.pricing[venue.name] = {
          basePrice: formData.basePrice?.[venue.name] || 0,
          currency: formData.currency?.[venue.name] || 'USD',
          priceUnit: formData.priceUnit?.[venue.name] || 'per event',
          taxRate: formData.taxRate?.[venue.name] || null,
          taxType: formData.taxType?.[venue.name] || null,
          discountPercent: formData.discountPercent?.[venue.name] || null,
          weekendRate: formData.weekendRate?.[venue.name] || null,
          peakSeasonRate: formData.peakSeasonRate?.[venue.name] || null,
          extraHourCharge: formData.extraHourCharge?.[venue.name] || null,
          depositRequired: formData.depositRequired?.[venue.name] || false,
          depositAmount: formData.depositAmount?.[venue.name] || null,
          refundable: formData.refundable?.[venue.name] !== undefined ? formData.refundable[venue.name] : true,
          cancellationPolicy: formData.cancellationPolicy?.[venue.name] || null,
          minHours: formData.minHours?.[venue.name] || 4,
          maxHours: formData.maxHours?.[venue.name] || null
        };
      });
      
      const response = await fetch(`${API_BASE_URL}/venue-specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Call the onSubmit prop if provided
        if (onSubmit) {
          onSubmit(result.data);
        } else {
          alert('Venue specifications saved successfully!');
        }
      } else {
        alert(result.message || 'Failed to save venue specifications');
      }
    } catch (error) {
      console.error('Error saving venue specifications:', error);
      alert('Server error while saving venue specifications');
    } finally {
      setLoading(false);
    }
  };

  // Table Header Component
  const TableHeader = () => {
    // Log to debug
    console.log('Rendering TableHeader with venues:', venueTypes.map(v => ({ id: v.id, name: v.name })));
    
    return (
      <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-2 font-medium text-gray-700">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider bg-gray-100 rounded">Features</div>
        {venueTypes.map(venue => (
          <div key={venue.id} className="px-2 py-1.5 bg-purple-50 rounded-md flex items-center justify-between group">
            <span className="text-[10px] font-semibold truncate">{venue.name || 'Unnamed'}</span>
            {venueTypes.length > 1 && (
              <button
                onClick={() => removeVenueType(venue.id, venue.name)}
                className="text-red-400 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove venue"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render a row with input boxes
  const renderInputRow = (label, field, type = 'text', options = null) => {
    // Skip if formData[field] is not defined
    if (!formData[field]) {
      console.warn(`Field ${field} not initialized in formData`);
      return null;
    }
    
    return (
      <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
        <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
        {venueTypes.map(venue => (
          <div key={venue.id} className="px-2">
            {type === 'select' ? (
              <select
                value={formData[field]?.[venue.name] || ''}
                onChange={(e) => handleInputChange(venue.name, field, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select</option>
                {options.map(opt => (
                  <option key={opt} value={opt} className="text-[10px]">{opt}</option>
                ))}
              </select>
            ) : type === 'number' ? (
              <input
                type="number"
                min="0"
                value={formData[field]?.[venue.name] || ''}
                onChange={(e) => handleInputChange(venue.name, field, e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            ) : type === 'currency' ? (
              <div className="flex gap-1">
                <select
                  value={formData.currency?.[venue.name] || 'USD'}
                  onChange={(e) => handleInputChange(venue.name, 'currency', e.target.value)}
                  className="w-16 px-1 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={formData[field]?.[venue.name] || ''}
                  onChange={(e) => handleInputChange(venue.name, field, e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            ) : (
              <input
                type="text"
                value={formData[field]?.[venue.name] || ''}
                onChange={(e) => handleInputChange(venue.name, field, e.target.value)}
                placeholder="Enter"
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render a row with checkboxes
  const renderCheckboxRow = (label, field) => {
    if (!formData[field]) return null;
    
    return (
      <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
        <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
        {venueTypes.map(venue => (
          <div key={venue.id} className="px-2 flex items-center">
            <input
              type="checkbox"
              checked={formData[field]?.[venue.name] || false}
              onChange={() => handleCheckboxChange(venue.name, field)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
          </div>
        ))}
      </div>
    );
  };

  // Render area row with unit
  const renderAreaRow = () => {
    if (!formData.totalArea || !formData.areaUnit) return null;
    
    return (
      <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100">
        <div className="px-2 text-[10px] text-gray-700 font-medium">Total Area</div>
        {venueTypes.map(venue => (
          <div key={venue.id} className="px-2 flex gap-1">
            <input
              type="number"
              value={formData.totalArea?.[venue.name] || ''}
              onChange={(e) => handleInputChange(venue.name, 'totalArea', e.target.value)}
              placeholder="Area"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <select
              value={formData.areaUnit?.[venue.name] || 'sq ft'}
              onChange={(e) => handleInputChange(venue.name, 'areaUnit', e.target.value)}
              className="w-16 px-1 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="sq ft" className="text-[10px]">sq ft</option>
              <option value="sq m" className="text-[10px]">sq m</option>
            </select>
          </div>
        ))}
      </div>
    );
  };

  // Render pricing row
  const renderPricingRow = () => (
    <>
      {renderInputRow('Base Price', 'basePrice', 'currency')}
      {renderInputRow('Price Unit', 'priceUnit', 'select', priceUnitOptions)}
      {renderInputRow('Tax Rate (%)', 'taxRate', 'number')}
      {renderInputRow('Tax Type', 'taxType', 'select', taxTypeOptions)}
      {renderInputRow('Discount (%)', 'discountPercent', 'number')}
      {renderInputRow('Weekend Rate', 'weekendRate', 'number')}
      {renderInputRow('Peak Season Rate', 'peakSeasonRate', 'number')}
      {renderInputRow('Extra Hour Charge', 'extraHourCharge', 'number')}
      {renderCheckboxRow('Deposit Required', 'depositRequired')}
      {renderInputRow('Deposit Amount', 'depositAmount', 'number')}
      {renderCheckboxRow('Refundable', 'refundable')}
      {renderInputRow('Cancellation Policy', 'cancellationPolicy', 'select', cancellationOptions)}
      {renderInputRow('Minimum Hours', 'minHours', 'number')}
      {renderInputRow('Maximum Hours', 'maxHours', 'number')}
    </>
  );

  // Render images row
  const renderImagesRow = () => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-start py-2 border-b border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">Venue Images</div>
      {venueTypes.map(venue => (
        <div key={venue.id} className="px-2">
          <div className="space-y-1">
            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(venue.name, e.target.files)}
                className="hidden"
                id={`image-upload-${venue.name}`}
              />
              <span className="block w-full px-2 py-1 bg-purple-50 text-purple-700 rounded text-[9px] font-medium text-center cursor-pointer hover:bg-purple-100 border border-purple-200">
                + Add Images
              </span>
            </label>
            
            {/* Image Previews */}
            {formData.venueImages?.[venue.name]?.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {formData.venueImages[venue.name].map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img.preview} 
                      alt={`Venue ${idx}`} 
                      className="w-full h-12 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemoveImage(venue.name, idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Venue Specifications</h2>
          <p className="text-[10px] text-gray-500">Configure multiple venue types side by side</p>
        </div>
        
        <div className="flex gap-2">
          {saveSuccess && (
            <span className="text-[10px] text-green-600 self-center">✓ Saved successfully!</span>
          )}
          <button
            onClick={() => setShowBulkImageModal(true)}
            className="px-3 py-1.5 bg-purple-500 text-white rounded text-[10px] font-medium hover:bg-purple-600 flex items-center gap-1"
            disabled={loading}
          >
            <span className="text-xs">📸</span> Bulk Images
          </button>
          <button
            onClick={openAddVenueModal}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600 flex items-center gap-1"
            disabled={loading}
          >
            <span className="text-xs">+</span> Add Venue Type
          </button>
          <button 
            onClick={handleSaveAllVenues}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save All Venues'}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div>
        {/* 🏛️ Section 1: Venue Overview */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🏛️ 1. Venue Overview
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Venue Name', 'venueName', 'text')}
            {renderInputRow('Venue Type', 'venueType', 'select', venueTypeOptions)}
            {renderAreaRow()}
            {renderInputRow('Seating Capacity (Theatre)', 'seatingCapacityTheatre', 'number')}
            {renderInputRow('Seating Capacity (Classroom)', 'seatingCapacityClassroom', 'number')}
            {renderInputRow('Seating Capacity (U-Shape)', 'seatingCapacityUShape', 'number')}
            {renderInputRow('Floating Capacity', 'floatingCapacity', 'number')}
            {renderInputRow('Number of Venues Available', 'numberOfVenues', 'number')}
          </div>
        </div>

        {/* 🪑 Section 2: Seating & Layout Options */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🪑 2. Seating & Layout Options
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Theatre Style Seating', 'theatreStyle')}
            {renderCheckboxRow('Round Table Seating', 'roundTableSeating')}
            {renderCheckboxRow('Classroom Setup', 'classroomSetup')}
            {renderCheckboxRow('Boardroom Setup', 'boardroomSetup')}
            {renderCheckboxRow('U-Shape Setup', 'uShapeSetup')}
            {renderCheckboxRow('Cluster Setup', 'clusterSetup')}
            {renderCheckboxRow('Custom Layout Options', 'customLayout')}
          </div>
        </div>

        {/* ❄️ Section 3: Climate & Comfort */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            ❄️ 3. Climate & Comfort
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Central Air Conditioning', 'centralAC')}
            {renderCheckboxRow('Outdoor Cooling/Heating', 'outdoorCooling')}
            {renderCheckboxRow('Ventilation System', 'ventilationSystem')}
            {renderCheckboxRow('Air Purifiers', 'airPurifiers')}
            {renderCheckboxRow('Backup Power Supply', 'backupPower')}
          </div>
        </div>

        {/* 🎤 Section 4: Audio-Visual & Equipment */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🎤 4. Audio-Visual & Equipment
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Microphones', 'microphones')}
            {renderInputRow('Microphone Type', 'microphoneType', 'select', microphoneTypeOptions)}
            {renderCheckboxRow('Sound System / Speakers', 'soundSystem')}
            {renderCheckboxRow('Projector & Screen', 'projectorScreen')}
            {renderCheckboxRow('LED Wall / Video Wall', 'ledWall')}
            {renderInputRow('Stage Lighting', 'stageLighting', 'select', stageLightingOptions)}
            {renderCheckboxRow('DJ Setup / Music System', 'djSetup')}
            {renderCheckboxRow('Video Conferencing Equipment', 'videoConferencing')}
            {renderCheckboxRow('Live Streaming Setup', 'liveStreaming')}
          </div>
        </div>

        {/* 🎭 Section 5: Stage & Decoration */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🎭 5. Stage & Decoration
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Built-in Stage', 'builtInStage')}
            {renderCheckboxRow('Custom Stage Setup', 'customStage')}
            {renderCheckboxRow('Event Decoration Services', 'eventDecoration')}
            {renderCheckboxRow('Floral Decoration', 'floralDecoration')}
            {renderCheckboxRow('Theme-based Decoration', 'themeDecoration')}
            {renderCheckboxRow('LED Lighting / Ambient Lighting', 'ledLighting')}
            {renderCheckboxRow('Entry Gate Decoration', 'entryGateDecoration')}
          </div>
        </div>

        {/* 🍽️ Section 6: Food & Catering */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🍽️ 6. Food & Catering
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('In-house Catering', 'inHouseCatering')}
            {renderCheckboxRow('Multi-cuisine Menu', 'multiCuisineMenu')}
            {renderCheckboxRow('Buffet Setup', 'buffetSetup')}
            {renderCheckboxRow('Live Counters', 'liveCounters')}
            {renderCheckboxRow('Bar Service', 'barService')}
            {renderInputRow('Outside Catering Allowed', 'outsideCatering', 'select', outsideCateringOptions)}
            {renderCheckboxRow('Kitchen Facility / Pantry', 'kitchenFacility')}
          </div>
        </div>

        {/* 🚻 Section 7: Washrooms & Hygiene */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🚻 7. Washrooms & Hygiene
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Separate Male/Female Washrooms', 'separateWashrooms')}
            {renderCheckboxRow('Accessible Washrooms', 'accessibleWashrooms')}
            {renderCheckboxRow('Baby Changing Station', 'babyChangingStation')}
            {renderCheckboxRow('Sanitization Facilities', 'sanitizationFacilities')}
            {renderCheckboxRow('Housekeeping Staff On-site', 'housekeepingStaff')}
          </div>
        </div>

        {/* 🅿️ Section 8: Parking & Transport */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🅿️ 8. Parking & Transport
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Parking Capacity (Cars)', 'parkingCapacityCars', 'number')}
            {renderInputRow('Parking Capacity (Buses)', 'parkingCapacityBuses', 'number')}
            {renderCheckboxRow('Valet Parking', 'valetParking')}
            {renderCheckboxRow('EV Charging Stations', 'evCharging')}
            {renderCheckboxRow('Shuttle Service', 'shuttleService')}
            {renderCheckboxRow('Nearby Transport Access', 'nearbyTransport')}
          </div>
        </div>

        {/* 🔐 Section 9: Safety & Security */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🔐 9. Safety & Security
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('CCTV Surveillance', 'cctvSurveillance')}
            {renderCheckboxRow('Security Guards', 'securityGuards')}
            {renderCheckboxRow('Fire Safety Equipment', 'fireSafety')}
            {renderCheckboxRow('Emergency Exits', 'emergencyExits')}
            {renderCheckboxRow('Metal Detectors', 'metalDetectors')}
          </div>
        </div>

        {/* 📶 Section 10: Connectivity & Technology */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            📶 10. Connectivity & Technology
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('High-Speed Wi-Fi', 'highSpeedWifi')}
            {renderCheckboxRow('LAN Connectivity', 'lanConnectivity')}
            {renderCheckboxRow('Charging Points', 'chargingPoints')}
            {renderCheckboxRow('Event Management Software', 'eventManagementSoftware')}
            {renderCheckboxRow('Digital Signage', 'digitalSignage')}
          </div>
        </div>

        {/* 👨‍💼 Section 11: Event Support Services */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            👨‍💼 11. Event Support Services
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Event Manager / Coordinator', 'eventManager')}
            {renderCheckboxRow('Wedding Planner Support', 'weddingPlanner')}
            {renderCheckboxRow('Technical Support Staff', 'technicalSupport')}
            {renderCheckboxRow('Registration Desk Setup', 'registrationDesk')}
            {renderCheckboxRow('Guest Assistance Desk', 'guestAssistance')}
          </div>
        </div>

        {/* 🏨 Section 12: Accommodation Support */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🏨 12. Accommodation Support
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Guest Rooms Available', 'guestRoomsAvailable', 'number')}
            {renderCheckboxRow('Bridal Room / Green Room', 'bridalRoom')}
            {renderCheckboxRow('VIP Suites', 'vipSuites')}
            {renderCheckboxRow('Changing Rooms for Performers', 'changingRooms')}
          </div>
        </div>

        {/* 🌿 Section 13: Outdoor & Special Features */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🌿 13. Outdoor & Special Features
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Garden / Lawn Area', 'gardenArea')}
            {renderCheckboxRow('Poolside Venue', 'poolsideVenue')}
            {renderCheckboxRow('Rooftop Venue', 'rooftopVenue')}
            {renderCheckboxRow('Scenic Views', 'scenicViews')}
            {renderCheckboxRow('Fireworks Allowed', 'fireworksAllowed')}
          </div>
        </div>

        {/* ♿ Section 14: Accessibility Features */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            ♿ 14. Accessibility Features
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Wheelchair Access', 'wheelchairAccess')}
            {renderCheckboxRow('Elevators', 'elevators')}
            {renderCheckboxRow('Ramp Access', 'rampAccess')}
            {renderCheckboxRow('Accessible Washrooms', 'accessibleWashroomsVenue')}
          </div>
        </div>

        {/* 🏆 Section 15: Premium / Luxury Amenities */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            🏆 15. Premium / Luxury Amenities
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Luxury Lounge Area', 'luxuryLounge')}
            {renderCheckboxRow('VIP Entry & Exit', 'vipEntry')}
            {renderCheckboxRow('Private Butler Service', 'privateButler')}
            {renderCheckboxRow('Helicopter Landing', 'helicopterLanding')}
            {renderCheckboxRow('Premium Decor Packages', 'premiumDecor')}
            {renderCheckboxRow('Celebrity Performance', 'celebrityPerformance')}
          </div>
        </div>

        {/* 💰 Section 16: Pricing */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            💰 16. Pricing & Billing
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderPricingRow()}
          </div>
        </div>

        {/* Images Section */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            📸 Venue Images
          </h2>
          <TableHeader />
          {renderImagesRow()}
        </div>

        {/* Additional Fields */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            📝 Additional Information
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Features', 'features')}
            {renderInputRow('Remarks', 'remarks')}
          </div>
        </div>

        {/* Cancel Button (if onCancel provided) */}
        {onCancel && (
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Add Venue Modal */}
      {showAddVenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Add New Venue Type</h3>
                <button
                  onClick={() => setShowAddVenueModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                placeholder="e.g., Grand Ballroom, Garden Lawn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-[8px] text-gray-500 mt-2">
                Enter a unique name for this venue type
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddVenueModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addNewVenueType}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600"
              >
                Add Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Image Upload Modal */}
      {showBulkImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Bulk Image Upload</h3>
                <button
                  onClick={() => setShowBulkImageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleBulkImageUpload(e.target.files)}
                  className="hidden"
                  id="bulk-image-upload"
                />
                <label htmlFor="bulk-image-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-[10px] text-gray-600 mb-1">Click to upload multiple images</p>
                  <p className="text-[8px] text-gray-500">or drag and drop</p>
                </label>
              </div>

              {bulkImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-medium text-gray-700 mb-2">
                    Selected Images ({bulkImages.length})
                  </p>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                    {bulkImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${idx}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-medium text-gray-700 mb-2">Assign to Venues:</p>
                    <div className="flex flex-wrap gap-3">
                      {venueTypes.map(venue => (
                        <label key={venue.id} className="flex items-center gap-1">
                          <input 
                            type="checkbox" 
                            name="bulk-venue-select"
                            value={venue.name}
                            className="w-3 h-3" 
                          />
                          <span className="text-[10px]">{venue.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkImageModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={assignBulkImages}
                disabled={bulkImages.length === 0}
                className="px-3 py-1.5 bg-purple-500 text-white rounded text-[10px] font-medium hover:bg-purple-600 disabled:opacity-50"
              >
                Assign Images
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSpecificationsForm;