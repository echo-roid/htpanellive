import React, { useState } from 'react';

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const RoomSpecificationsForm = ({ onSubmit, onCancel }) => {
  const [roomTypes, setRoomTypes] = useState([
    // { id: 1, name: 'Deluxe Room', active: true },
    // { id: 2, name: 'Royal Room', active: true },
    // { id: 3, name: 'Suite Room', active: true }
  ]);

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkPricing, setBulkPricing] = useState({
    basePrice: '',
    taxRate: '18',
    discount: '',
    weekendRate: '',
    peakSeasonRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Main billing section toggle
  const [billingEnabled, setBillingEnabled] = useState(true);

  // Billing feature toggles (only used when billing is enabled)
  const [billingFeatures, setBillingFeatures] = useState({
    taxEnabled: true,
    discountEnabled: false,
    weekendRateEnabled: false,
    peakSeasonRateEnabled: false,
    extraPersonChargeEnabled: false,
    extraBedChargeEnabled: false,
    breakfastEnabled: false,
    cancellationPolicyEnabled: true,
    minMaxStayEnabled: false
  });

  // Get default values for a new room
  const getDefaultRoomValues = () => {
    return {
      // Room Specifications
      roomSize: '',
      roomSizeUnit: 'sq ft',
      bedType: '',
      bedArrangement: 'single',
      numberOfBeds: '',
      maximumOccupancy: '',
      smokingPolicy: 'non-smoking',
      floorLevel: '',
      
      // Climate & Comfort
      airConditioning: 'none',
      
      // Checkbox features
      soundproofRooms: false,
      connectingRooms: false,
      heatingSystem: false,
      ceilingFan: false,
      humidityControl: false,
      blackoutCurtains: false,
      soundInsulation: false,
      
      // Furniture & Fixtures
      bedsideTables: '',
      sofaCouch: '',
      workDesk: '',
      coffeeTable: '',
      wardrobe: '',
      luggageRack: '',
      fullLengthMirror: '',
      readingLamps: '',
      
      // Entertainment
      smartTV: false,
      tvChannels: false,
      inRoomTablet: false,
      bluetoothSpeaker: false,
      gamingConsole: false,
      payPerViewMovies: false,
      
      // Connectivity
      highSpeedWifi: '',
      lanPort: false,
      usbChargingPorts: false,
      universalPowerSockets: false,
      smartRoomAutomation: false,
      mobileKeyAccess: false,
      
      // OTT Apps
      ottApps: [],
      
      // Images
      roomImages: [],
      
      // Billing & Pricing
      basePrice: '',
      currency: 'USD',
      priceUnit: 'per night',
      taxRate: '18',
      taxType: 'gst',
      discountPercent: '',
      weekendRate: '',
      peakSeasonRate: '',
      extraPersonCharge: '',
      extraBedCharge: '',
      breakfastIncluded: false,
      breakfastPrice: '',
      refundable: true,
      cancellationPolicy: 'flexible',
      minStay: '1',
      maxStay: '',
      
      // Additional
      features: '',
      remarks: ''
    };
  };

  // Initialize form data for existing rooms
  const initializeFormData = (rooms) => {
    const defaultValues = getDefaultRoomValues();
    const initialData = {};
    
    // Get all field names from defaultValues
    const fieldNames = Object.keys(defaultValues);
    
    // Initialize each field as an empty object
    fieldNames.forEach(field => {
      initialData[field] = {};
    });
    
    // Populate with existing rooms
    rooms.forEach(room => {
      fieldNames.forEach(field => {
        // Set default values for each field
        if (field === 'roomImages') {
          initialData[field][room.name] = [];
        } else if (field === 'currency') {
          initialData[field][room.name] = 'USD';
        } else if (field === 'roomSizeUnit') {
          initialData[field][room.name] = 'sq ft';
        } else if (field === 'priceUnit') {
          initialData[field][room.name] = 'per night';
        } else if (field === 'taxRate') {
          initialData[field][room.name] = '18';
        } else if (field === 'taxType') {
          initialData[field][room.name] = 'gst';
        } else if (field === 'cancellationPolicy') {
          initialData[field][room.name] = 'flexible';
        } else if (field === 'minStay') {
          initialData[field][room.name] = '1';
        } else if (field === 'refundable') {
          initialData[field][room.name] = true;
        } else if (field === 'bedArrangement') {
          initialData[field][room.name] = 'single';
        } else if (field === 'smokingPolicy') {
          initialData[field][room.name] = 'non-smoking';
        } else if (field === 'airConditioning') {
          initialData[field][room.name] = 'none';
        } else if (field === 'roomName') {
          initialData[field][room.name] = room.name;
        } else if (typeof defaultValues[field] === 'boolean') {
          initialData[field][room.name] = false;
        } else if (Array.isArray(defaultValues[field])) {
          initialData[field][room.name] = [];
        } else {
          initialData[field][room.name] = '';
        }
      });
    });
    
    return initialData;
  };

  // Form data state for multiple rooms
  const [formData, setFormData] = useState(() => initializeFormData(roomTypes));

  // Options
  const bedTypeOptions = ['King', 'Queen', 'Twin', 'Bunk', 'California King', 'Double'];
  const smokingOptions = ['smoking', 'non-smoking', 'both'];
  const acOptions = ['none', 'central', 'split', 'window'];
  const wifiOptions = ['Free (Basic)', 'Free (High-Speed)', 'Paid', 'Premium'];
  const ottAppOptions = ['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'YouTube', 'Hulu', 'Apple TV+'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'];
  const priceUnitOptions = ['per night', 'per hour', 'per person', 'per week', 'per month'];
  const taxTypeOptions = ['gst', 'vat', 'sales tax', 'service tax', 'no tax'];
  const cancellationOptions = ['flexible', 'moderate', 'strict', 'non-refundable'];

  // Handle input changes
  const handleInputChange = (roomName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [roomName]: value
      }
    }));
  };

  const handleCheckboxChange = (roomName, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [roomName]: !prev[field][roomName]
      }
    }));
  };

  const handleImageUpload = (roomName, files) => {
    const imageArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      data: file
    }));

    setFormData(prev => ({
      ...prev,
      roomImages: {
        ...prev.roomImages,
        [roomName]: [...(prev.roomImages[roomName] || []), ...imageArray]
      }
    }));
  };

  const handleRemoveImage = (roomName, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      roomImages: {
        ...prev.roomImages,
        [roomName]: prev.roomImages[roomName].filter((_, idx) => idx !== imageIndex)
      }
    }));
  };

  const handleBulkImageUpload = (files) => {
    setBulkImages(Array.from(files));
  };

  const assignBulkImages = () => {
    const selectedRooms = Array.from(document.querySelectorAll('input[name="bulk-room-select"]:checked'))
      .map(checkbox => checkbox.value);
    
    if (selectedRooms.length === 0) {
      alert('Please select at least one room to assign images');
      return;
    }
    
    const imageArray = bulkImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      data: file
    }));
    
    const updatedFormData = { ...formData };
    selectedRooms.forEach(roomName => {
      updatedFormData.roomImages[roomName] = [
        ...(updatedFormData.roomImages[roomName] || []),
        ...imageArray
      ];
    });
    
    setFormData(updatedFormData);
    setShowBulkImageModal(false);
    setBulkImages([]);
    alert(`Assigned ${bulkImages.length} images to ${selectedRooms.length} room(s)`);
  };

  const handleBulkPricingApply = () => {
    if (!billingEnabled) {
      alert('Billing is disabled. Please enable billing first.');
      return;
    }
    
    // Apply bulk pricing to all rooms
    const updatedFormData = { ...formData };
    roomTypes.forEach(room => {
      if (bulkPricing.basePrice) {
        updatedFormData.basePrice[room.name] = bulkPricing.basePrice;
      }
      if (bulkPricing.taxRate && billingFeatures.taxEnabled) {
        updatedFormData.taxRate[room.name] = bulkPricing.taxRate;
      }
      if (bulkPricing.discount && billingFeatures.discountEnabled) {
        updatedFormData.discountPercent[room.name] = bulkPricing.discount;
      }
      if (bulkPricing.weekendRate && billingFeatures.weekendRateEnabled) {
        updatedFormData.weekendRate[room.name] = bulkPricing.weekendRate;
      }
      if (bulkPricing.peakSeasonRate && billingFeatures.peakSeasonRateEnabled) {
        updatedFormData.peakSeasonRate[room.name] = bulkPricing.peakSeasonRate;
      }
    });
    
    setFormData(updatedFormData);
    setShowBulkPricingModal(false);
    alert('Bulk pricing applied to all rooms!');
  };

  const toggleBillingFeature = (feature) => {
    setBillingFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const openAddRoomModal = () => {
    setNewRoomName('');
    setShowAddRoomModal(true);
  };

  const addNewRoomType = () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    const roomName = newRoomName.trim();
    
    // Check if room name already exists
    if (roomTypes.some(r => r.name === roomName)) {
      alert('Room name already exists!');
      return;
    }
    
    // Add new room to roomTypes
    const newRoom = { id: Date.now(), name: roomName, active: true };
    const updatedRoomTypes = [...roomTypes, newRoom];
    setRoomTypes(updatedRoomTypes);
    
    // Get default values for the new room
    const defaultValues = getDefaultRoomValues();
    
    // Update form data for all rooms
    setFormData(prev => {
      const newFormData = { ...prev };
      
      // Get all field names
      const fieldNames = Object.keys(defaultValues);
      
      // For each field, add the new room with default values
      fieldNames.forEach(field => {
        if (!newFormData[field]) {
          newFormData[field] = {};
        }
        
        // Set default value based on field type
        if (field === 'roomImages') {
          newFormData[field][roomName] = [];
        } else if (field === 'ottApps') {
          newFormData[field][roomName] = [];
        } else if (field === 'currency') {
          newFormData[field][roomName] = 'USD';
        } else if (field === 'roomSizeUnit') {
          newFormData[field][roomName] = 'sq ft';
        } else if (field === 'priceUnit') {
          newFormData[field][roomName] = 'per night';
        } else if (field === 'taxRate') {
          newFormData[field][roomName] = '18';
        } else if (field === 'taxType') {
          newFormData[field][roomName] = 'gst';
        } else if (field === 'cancellationPolicy') {
          newFormData[field][roomName] = 'flexible';
        } else if (field === 'minStay') {
          newFormData[field][roomName] = '1';
        } else if (field === 'refundable') {
          newFormData[field][roomName] = true;
        } else if (field === 'bedArrangement') {
          newFormData[field][roomName] = 'single';
        } else if (field === 'smokingPolicy') {
          newFormData[field][roomName] = 'non-smoking';
        } else if (field === 'airConditioning') {
          newFormData[field][roomName] = 'none';
        } else if (typeof defaultValues[field] === 'boolean') {
          newFormData[field][roomName] = false;
        } else if (Array.isArray(defaultValues[field])) {
          newFormData[field][roomName] = [];
        } else {
          newFormData[field][roomName] = '';
        }
      });
      
      return newFormData;
    });

    setShowAddRoomModal(false);
    setNewRoomName('');
  };

  const removeRoomType = (roomId, roomName) => {
    if (roomTypes.length <= 1) {
      alert('You need at least one room type');
      return;
    }
    
    setRoomTypes(roomTypes.filter(r => r.id !== roomId));
    
    setFormData(prev => {
      const newFormData = { ...prev };
      Object.keys(prev).forEach(field => {
        if (typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
          delete newFormData[field][roomName];
        }
      });
      return newFormData;
    });
  };

  // Calculate total price with tax and discount (only if billing is enabled)
  const calculateTotalPrice = (roomName) => {
    if (!billingEnabled) return '0.00';
    
    const basePrice = parseFloat(formData.basePrice?.[roomName]) || 0;
    const taxRate = billingFeatures.taxEnabled ? (parseFloat(formData.taxRate?.[roomName]) || 0) : 0;
    const discount = billingFeatures.discountEnabled ? (parseFloat(formData.discountPercent?.[roomName]) || 0) : 0;
    
    const taxAmount = (basePrice * taxRate) / 100;
    const discountAmount = (basePrice * discount) / 100;
    const total = basePrice + taxAmount - discountAmount;
    
    return total.toFixed(2);
  };

  // Save all room specifications
  const handleSaveAllRooms = async () => {
    try {
      setLoading(true);
      
      // Prepare payload
      const payload = {
        roomTypes: roomTypes.map(rt => ({ name: rt.name, active: rt.active })),
        specifications: formData,
        billingEnabled: billingEnabled,
        billingFeatures: billingFeatures
      };
      
      const response = await fetch(`${API_BASE_URL}/rooms/room-specifications`, {
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
        
        if (onSubmit) {
          onSubmit(result.data);
        } else {
          alert('Room specifications saved successfully!');
        }
      } else {
        alert(result.message || 'Failed to save room specifications');
      }
    } catch (error) {
      console.error('Error saving room specifications:', error);
      alert('Server error while saving room specifications');
    } finally {
      setLoading(false);
    }
  };

  // Table Header Component
  const TableHeader = () => (
    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-2 font-medium text-gray-700">
      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider bg-gray-100 rounded">Features</div>
      {roomTypes.map(room => (
        <div key={room.id} className="px-2 py-1.5 bg-blue-50 rounded-md flex items-center justify-between group">
          <span className="text-[10px] font-semibold truncate">{room.name}</span>
          {roomTypes.length > 1 && (
            <button
              onClick={() => removeRoomType(room.id, room.name)}
              className="text-red-400 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove room"
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

  // Render a row with input boxes
  const renderInputRow = (label, field, type = 'text', options = null) => {
    if (!formData[field]) return null;
    
    return (
      <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
        <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
        {roomTypes.map(room => (
          <div key={room.id} className="px-2">
            {type === 'select' ? (
              <select
                value={formData[field]?.[room.name] || ''}
                onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                value={formData[field]?.[room.name] || ''}
                onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : type === 'currency' ? (
              <div className="flex gap-1">
                <select
                  value={formData.currency?.[room.name] || 'USD'}
                  onChange={(e) => handleInputChange(room.name, 'currency', e.target.value)}
                  className="w-16 px-1 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={formData[field]?.[room.name] || ''}
                  onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : type === 'radio-group' ? (
              <div className="flex gap-3">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`${field}-${room.name}`}
                    value="single"
                    checked={formData[field]?.[room.name] === 'single'}
                    onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                    className="w-3 h-3 text-blue-600"
                  />
                  <span className="text-[9px]">Single</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`${field}-${room.name}`}
                    value="twin"
                    checked={formData[field]?.[room.name] === 'twin'}
                    onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                    className="w-3 h-3 text-blue-600"
                  />
                  <span className="text-[9px]">Twin</span>
                </label>
              </div>
            ) : (
              <input
                type="text"
                value={formData[field]?.[room.name] || ''}
                onChange={(e) => handleInputChange(room.name, field, e.target.value)}
                placeholder="Enter"
                className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
        <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
        {roomTypes.map(room => (
          <div key={room.id} className="px-2 flex items-center">
            <input
              type="checkbox"
              checked={formData[field]?.[room.name] || false}
              onChange={() => handleCheckboxChange(room.name, field)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    );
  };

  // Render size row with unit
  const renderSizeRow = () => {
    if (!formData.roomSize || !formData.roomSizeUnit) return null;
    
    return (
      <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100">
        <div className="px-2 text-[10px] text-gray-700 font-medium">Room Size</div>
        {roomTypes.map(room => (
          <div key={room.id} className="px-2 flex gap-1">
            <input
              type="number"
              value={formData.roomSize?.[room.name] || ''}
              onChange={(e) => handleInputChange(room.name, 'roomSize', e.target.value)}
              placeholder="Size"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={formData.roomSizeUnit?.[room.name] || 'sq ft'}
              onChange={(e) => handleInputChange(room.name, 'roomSizeUnit', e.target.value)}
              className="w-14 px-1 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="sq ft" className="text-[10px]">sq ft</option>
              <option value="sq m" className="text-[10px]">sq m</option>
            </select>
          </div>
        ))}
      </div>
    );
  };

  // Render special features row
  const renderSpecialFeaturesRow = () => (
    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center py-1 border-b border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">Special Features</div>
      {roomTypes.map(room => (
        <div key={room.id} className="px-2 flex flex-wrap gap-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={formData.soundproofRooms?.[room.name] || false}
              onChange={() => handleCheckboxChange(room.name, 'soundproofRooms')}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] whitespace-nowrap">Soundproof</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={formData.connectingRooms?.[room.name] || false}
              onChange={() => handleCheckboxChange(room.name, 'connectingRooms')}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] whitespace-nowrap">Connecting</span>
          </label>
        </div>
      ))}
    </div>
  );

  // Render OTT Apps row
  const renderOttAppsRow = () => (
    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-start py-1 border-b border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">OTT Apps</div>
      {roomTypes.map(room => (
        <div key={room.id} className="px-2">
          <select
            multiple
            size="2"
            value={formData.ottApps?.[room.name] || []}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, opt => opt.value);
              handleInputChange(room.name, 'ottApps', selectedOptions);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ottAppOptions.map(app => (
              <option key={app} value={app} className="text-[10px]">{app}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );

  // Render images row
  const renderImagesRow = () => (
    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-start py-2 border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">Room Images</div>
      {roomTypes.map(room => (
        <div key={room.id} className="px-2">
          <div className="space-y-1">
            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(room.name, e.target.files)}
                className="hidden"
                id={`image-upload-${room.name}`}
              />
              <span className="block w-full px-2 py-1 bg-blue-50 text-blue-700 rounded text-[9px] font-medium text-center cursor-pointer hover:bg-blue-100 border border-blue-200">
                + Add Images
              </span>
            </label>
            
            {/* Image Previews */}
            {formData.roomImages?.[room.name]?.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {formData.roomImages[room.name].map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img.preview || img.url} 
                      alt={`Room ${idx}`} 
                      className="w-full h-12 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemoveImage(room.name, idx)}
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

  // Render billing feature toggles (only shown when billing is enabled)
  const renderBillingFeatureToggles = () => {
    if (!billingEnabled) return null;
    
    return (
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="text-[10px] font-medium text-gray-700 mb-2">Billing Features (Enable/Disable)</div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.taxEnabled}
              onChange={() => toggleBillingFeature('taxEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Tax</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.discountEnabled}
              onChange={() => toggleBillingFeature('discountEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Discount</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.weekendRateEnabled}
              onChange={() => toggleBillingFeature('weekendRateEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Weekend Rate</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.peakSeasonRateEnabled}
              onChange={() => toggleBillingFeature('peakSeasonRateEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Peak Season Rate</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.extraPersonChargeEnabled}
              onChange={() => toggleBillingFeature('extraPersonChargeEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Extra Person Charge</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.extraBedChargeEnabled}
              onChange={() => toggleBillingFeature('extraBedChargeEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Extra Bed Charge</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.breakfastEnabled}
              onChange={() => toggleBillingFeature('breakfastEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Breakfast</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.cancellationPolicyEnabled}
              onChange={() => toggleBillingFeature('cancellationPolicyEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Cancellation Policy</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.minMaxStayEnabled}
              onChange={() => toggleBillingFeature('minMaxStayEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-blue-600"
            />
            <span className="text-[9px] text-gray-600">Min/Max Stay</span>
          </label>
        </div>
      </div>
    );
  };

  // Render total price row (only if billing is enabled)
  const renderTotalRow = () => {
    if (!billingEnabled) return null;
    
    return (
      <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center py-1 bg-green-50 border-t border-green-200 font-semibold">
        <div className="px-2 text-[10px] text-green-800">Total (after tax & discount)</div>
        {roomTypes.map(room => (
          <div key={room.id} className="px-2 text-[10px] text-green-800">
            {formData.currency?.[room.name] || 'USD'} {calculateTotalPrice(room.name)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Room Specifications</h2>
          <p className="text-[10px] text-gray-500">Configure multiple room types side by side</p>
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
            onClick={openAddRoomModal}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600 flex items-center gap-1"
            disabled={loading}
          >
            <span className="text-xs">+</span> Add Room Type
          </button>
          <button
            onClick={() => setShowBulkPricingModal(true)}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded text-[10px] font-medium hover:bg-yellow-600 flex items-center gap-1"
            disabled={loading}
          >
            <span className="text-xs">💰</span> Bulk Pricing
          </button>
          <button
            onClick={handleSaveAllRooms}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save All Rooms'}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div>
        {/* Section 1: Room Specifications */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            1. Room Specifications
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderSizeRow()}
            {renderInputRow('Bed Type', 'bedType', 'select', bedTypeOptions)}
            {renderInputRow('Bed Arrangement', 'bedArrangement', 'radio-group')}
            {renderInputRow('Number of Beds', 'numberOfBeds', 'number')}
            {renderInputRow('Maximum Occupancy', 'maximumOccupancy', 'number')}
            {renderInputRow('Smoking Policy', 'smokingPolicy', 'select', smokingOptions)}
            {renderInputRow('Floor Level', 'floorLevel', 'text')}
            {renderSpecialFeaturesRow()}
          </div>
        </div>

        {/* Section 2: Climate & Comfort Control */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            2. Climate & Comfort Control
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Air Conditioning', 'airConditioning', 'select', acOptions)}
            {renderCheckboxRow('Heating System', 'heatingSystem')}
            {renderCheckboxRow('Ceiling Fan', 'ceilingFan')}
            {renderCheckboxRow('Humidity Control', 'humidityControl')}
            {renderCheckboxRow('Blackout Curtains', 'blackoutCurtains')}
            {renderCheckboxRow('Sound Insulation', 'soundInsulation')}
          </div>
        </div>

        {/* Section 3: Furniture & Fixtures */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            3. Furniture & Fixtures
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Bedside Tables', 'bedsideTables', 'number')}
            {renderInputRow('Sofa / Lounge Chair', 'sofaCouch', 'number')}
            {renderInputRow('Work Desk', 'workDesk', 'number')}
            {renderInputRow('Coffee Table', 'coffeeTable', 'number')}
            {renderInputRow('Wardrobe', 'wardrobe', 'number')}
            {renderInputRow('Luggage Rack', 'luggageRack', 'number')}
            {renderInputRow('Full-Length Mirror', 'fullLengthMirror', 'number')}
            {renderInputRow('Reading Lamps', 'readingLamps', 'number')}
          </div>
        </div>

        {/* Section 4: Entertainment & Media */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            4. Entertainment & Media
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderCheckboxRow('Smart TV', 'smartTV')}
            {renderCheckboxRow('TV Channels', 'tvChannels')}
            {renderCheckboxRow('In-room Tablet', 'inRoomTablet')}
            {renderCheckboxRow('Bluetooth Speaker', 'bluetoothSpeaker')}
            {renderCheckboxRow('Gaming Console', 'gamingConsole')}
            {renderCheckboxRow('Pay-Per-View', 'payPerViewMovies')}
            {renderOttAppsRow()}
          </div>
        </div>

        {/* Section 5: Connectivity & Technology */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            5. Connectivity & Technology
          </h2>
          <TableHeader />
          <div className="space-y-0.5">
            {renderInputRow('Wi-Fi', 'highSpeedWifi', 'select', wifiOptions)}
            {renderCheckboxRow('LAN Port', 'lanPort')}
            {renderCheckboxRow('USB Charging Ports', 'usbChargingPorts')}
            {renderCheckboxRow('Universal Power Sockets', 'universalPowerSockets')}
            {renderCheckboxRow('Smart Room Automation', 'smartRoomAutomation')}
            {renderCheckboxRow('Mobile Key Access', 'mobileKeyAccess')}
          </div>
        </div>

        {/* Section 6: Billing & Pricing - WITH MAIN TOGGLE */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200">
            <h2 className="text-xs font-semibold text-gray-800">6. Billing & Pricing</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600">Enable Billing</span>
              <button
                onClick={() => setBillingEnabled(!billingEnabled)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                  billingEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    billingEnabled ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Only show billing fields if enabled */}
          {billingEnabled && (
            <>
              {/* Billing Feature Toggles */}
              {renderBillingFeatureToggles()}
              
              <TableHeader />
              <div className="space-y-0.5">
                {/* Always visible - Basic Pricing */}
                {renderInputRow('Base Price', 'basePrice', 'currency')}
                {renderInputRow('Price Unit', 'priceUnit', 'select', priceUnitOptions)}
                
                {/* Tax - Only when enabled */}
                {billingFeatures.taxEnabled && (
                  <>
                    {renderInputRow('Tax Rate (%)', 'taxRate', 'number')}
                    {renderInputRow('Tax Type', 'taxType', 'select', taxTypeOptions)}
                  </>
                )}
                
                {/* Conditional fields based on toggles */}
                {billingFeatures.discountEnabled && (
                  renderInputRow('Discount (%)', 'discountPercent', 'number')
                )}
                
                {billingFeatures.weekendRateEnabled && (
                  renderInputRow('Weekend Rate', 'weekendRate', 'number')
                )}
                
                {billingFeatures.peakSeasonRateEnabled && (
                  renderInputRow('Peak Season Rate', 'peakSeasonRate', 'number')
                )}
                
                {billingFeatures.extraPersonChargeEnabled && (
                  renderInputRow('Extra Person Charge', 'extraPersonCharge', 'number')
                )}
                
                {billingFeatures.extraBedChargeEnabled && (
                  renderInputRow('Extra Bed Charge', 'extraBedCharge', 'number')
                )}
                
                {billingFeatures.breakfastEnabled && (
                  <>
                    {renderCheckboxRow('Breakfast Included', 'breakfastIncluded')}
                    {renderInputRow('Breakfast Price', 'breakfastPrice', 'number')}
                  </>
                )}
                
                {billingFeatures.cancellationPolicyEnabled && (
                  <>
                    {renderCheckboxRow('Refundable', 'refundable')}
                    {renderInputRow('Cancellation Policy', 'cancellationPolicy', 'select', cancellationOptions)}
                  </>
                )}
                
                {billingFeatures.minMaxStayEnabled && (
                  <>
                    {renderInputRow('Minimum Stay (nights)', 'minStay', 'number')}
                    {renderInputRow('Maximum Stay (nights)', 'maxStay', 'number')}
                  </>
                )}
                
                {/* Total Row */}
                {renderTotalRow()}
              </div>
            </>
          )}
          
          {/* Show message when billing is disabled */}
          {!billingEnabled && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-[10px] text-gray-500">Billing section is disabled. Toggle the switch above to enable pricing options.</p>
            </div>
          )}
        </div>

        {/* Section 7: Images */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
            7. Room Images
          </h2>
          <TableHeader />
          {renderImagesRow()}
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

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Add New Room Type</h3>
                <button
                  onClick={() => setShowAddRoomModal(false)}
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
                Room Name
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g., Presidential Suite, Family Room"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-[8px] text-gray-500 mt-2">
                Enter a unique name for this room type
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addNewRoomType}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600"
              >
                Add Room
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
                    <p className="text-[10px] font-medium text-gray-700 mb-2">Assign to Rooms:</p>
                    <div className="flex flex-wrap gap-3">
                      {roomTypes.map(room => (
                        <label key={room.id} className="flex items-center gap-1">
                          <input 
                            type="checkbox" 
                            name="bulk-room-select"
                            value={room.name}
                            className="w-3 h-3" 
                          />
                          <span className="text-[10px]">{room.name}</span>
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

      {/* Bulk Pricing Modal */}
      {showBulkPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Bulk Pricing Setup</h3>
                <button
                  onClick={() => setShowBulkPricingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Apply same pricing to all room types
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <input
                  type="number"
                  value={bulkPricing.basePrice}
                  onChange={(e) => setBulkPricing({...bulkPricing, basePrice: e.target.value})}
                  placeholder="Enter base price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {billingFeatures.taxEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.taxRate}
                    onChange={(e) => setBulkPricing({...bulkPricing, taxRate: e.target.value})}
                    placeholder="Enter tax rate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {billingFeatures.discountEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.discount}
                    onChange={(e) => setBulkPricing({...bulkPricing, discount: e.target.value})}
                    placeholder="Enter discount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {billingFeatures.weekendRateEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Weekend Rate
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.weekendRate}
                    onChange={(e) => setBulkPricing({...bulkPricing, weekendRate: e.target.value})}
                    placeholder="Enter weekend rate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {billingFeatures.peakSeasonRateEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Peak Season Rate
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.peakSeasonRate}
                    onChange={(e) => setBulkPricing({...bulkPricing, peakSeasonRate: e.target.value})}
                    placeholder="Enter peak season rate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkPricingModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPricingApply}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded text-[10px] font-medium hover:bg-yellow-600"
              >
                Apply to All Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSpecificationsForm;