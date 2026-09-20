import React, { useState, useEffect } from 'react';

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

const HotelSpecificationsForm = () => {
  const [hotelTypes, setHotelTypes] = useState([
    { id: 1, name: 'Grand Hyatt', active: true },
  ]);

  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [bulkImages, setBulkImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Main billing section toggle
  const [billingEnabled, setBillingEnabled] = useState(true);
  
  // Bulk pricing state
  const [bulkPricing, setBulkPricing] = useState({
    basePrice: '',
    taxRate: '18',
    discount: '',
    weekendRate: '',
    peakSeasonRate: '',
    securityDeposit: '',
    cleaningFee: ''
  });

  // Billing feature toggles
  const [billingFeatures, setBillingFeatures] = useState({
    taxEnabled: true,
    discountEnabled: false,
    weekendRateEnabled: false,
    peakSeasonRateEnabled: false,
    securityDepositEnabled: true,
    cleaningFeeEnabled: true,
    extraPersonChargeEnabled: false,
    breakfastIncludedEnabled: false,
    cancellationPolicyEnabled: true,
    minMaxStayEnabled: false
  });

  // Form data state for multiple hotels
  const [formData, setFormData] = useState({
    // 📌 1. Basic Information
    hotelName: {
      'Grand Hyatt': 'Grand Hyatt',
      'Marriott': '',
      'Hilton': ''
    },
    hotelCode: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    shortDescription: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    longDescription: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    starRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    propertyType: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    brandName: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    yearBuilt: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    yearRenovated: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    
    // 📍 2. Location Details
    address: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    city: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    state: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    country: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    pinCode: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    latitude: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    longitude: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    airportDistance: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    railwayDistance: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    metroStation: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    touristAttractions: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    
    // 🏨 3. Property Facilities - General
    frontDesk24x7: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    elevator: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    luggageStorage: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    powerBackup: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    atmCurrencyExchange: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // Leisure Facilities
    swimmingPool: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    spaWellness: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    gym: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    gardenLawn: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    kidsPlayArea: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🛏️ 4. Room Details
    totalRooms: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomTypesDeluxe: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomTypesStandard: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomTypesSuite: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomTypesFamily: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomSize: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomSizeUnit: {
      'Grand Hyatt': 'sq ft',
      'Marriott': 'sq ft',
      'Hilton': 'sq ft'
    },
    bedType: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    occupancy: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    roomAmenities: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    
    // 🍽️ 5. Dining & Food
    restaurantInhouse: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    cuisineTypes: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    barLounge: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    breakfastAvailable: {
      'Grand Hyatt': 'free',
      'Marriott': 'free',
      'Hilton': 'free'
    },
    roomService: {
      'Grand Hyatt': '24x7',
      'Marriott': '24x7',
      'Hilton': '24x7'
    },
    
    // 🛎️ 6. Services Offered
    housekeeping: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    laundryService: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    concierge: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    wakeupCall: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    airportTransfer: {
      'Grand Hyatt': 'paid',
      'Marriott': 'paid',
      'Hilton': 'paid'
    },
    carRental: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🏢 7. Business & Event Facilities
    conferenceRooms: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    banquetHall: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    meetingRooms: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    projectorAV: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    eventManagement: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🔐 8. Safety & Security
    cctvSurveillance: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    securityGuards: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    fireSafety: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    smokeDetectors: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    firstAid: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 📶 9. Connectivity
    freeWifi: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    internetSpeed: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    businessCenterInternet: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🅿️ 10. Parking & Transport
    freeParking: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    paidParking: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    valetParking: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    evCharging: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    shuttleService: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 👨‍👩‍👧 11. Policies
    checkInTime: {
      'Grand Hyatt': '14:00',
      'Marriott': '14:00',
      'Hilton': '14:00'
    },
    checkOutTime: {
      'Grand Hyatt': '12:00',
      'Marriott': '12:00',
      'Hilton': '12:00'
    },
    cancellationPolicy: {
      'Grand Hyatt': 'flexible',
      'Marriott': 'flexible',
      'Hilton': 'flexible'
    },
    childPolicy: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    petPolicy: {
      'Grand Hyatt': 'not allowed',
      'Marriott': 'not allowed',
      'Hilton': 'not allowed'
    },
    idProofRequired: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 💳 12. Payment Options
    cash: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    creditCard: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    upi: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    netBanking: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    wallets: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🖼️ 13. Media & Images
    hotelImages: {
      'Grand Hyatt': [],
      'Marriott': [],
      'Hilton': []
    },
    
    // ⭐ 14. Reviews & Ratings
    overallRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    reviewCount: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    guestReviews: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    cleanlinessRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    locationRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    serviceRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    valueForMoneyRating: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    
    // 🌟 15. Accessibility Features
    wheelchairAccess: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    elevatorAccess: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    accessibleRooms: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    accessibleWashrooms: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 🏆 16. Highlights / Tags
    coupleFriendly: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    familyFriendly: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    businessFriendly: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    luxuryStay: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    budgetStay: {
      'Grand Hyatt': false,
      'Marriott': false,
      'Hilton': false
    },
    
    // 💰 17. Billing & Pricing
    basePrice: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    currency: {
      'Grand Hyatt': 'USD',
      'Marriott': 'USD',
      'Hilton': 'USD'
    },
    priceUnit: {
      'Grand Hyatt': 'per night',
      'Marriott': 'per night',
      'Hilton': 'per night'
    },
    taxRate: {
      'Grand Hyatt': '18',
      'Marriott': '18',
      'Hilton': '18'
    },
    taxType: {
      'Grand Hyatt': 'gst',
      'Marriott': 'gst',
      'Hilton': 'gst'
    },
    discountPercent: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    weekendRate: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    peakSeasonRate: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    securityDeposit: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    cleaningFee: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    extraPersonCharge: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    breakfastPrice: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    refundable: {
      'Grand Hyatt': true,
      'Marriott': true,
      'Hilton': true
    },
    minStay: {
      'Grand Hyatt': '1',
      'Marriott': '1',
      'Hilton': '1'
    },
    maxStay: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    
    // Additional
    features: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    },
    remarks: {
      'Grand Hyatt': '',
      'Marriott': '',
      'Hilton': ''
    }
  });

  // Fetch existing data on component mount
  useEffect(() => {
    fetchHotelSpecifications();
  }, []);

  // Fetch hotel specifications from API
  const fetchHotelSpecifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/hotel-specifications`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Update hotel types
        const fetchedHotelTypes = result.data.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          active: hotel.active
        }));
        setHotelTypes(fetchedHotelTypes);
        
        // Update form data
        const newFormData = { ...formData };
        
        result.data.forEach(hotel => {
          const hotelName = hotel.name;
          const specs = hotel.specifications;
          const pricing = hotel.pricing;
          const billingFeat = hotel.billingFeatures;
          
          // Populate all fields from specifications
          Object.keys(specs).forEach(field => {
            if (newFormData[field] !== undefined && specs[field] !== undefined) {
              newFormData[field][hotelName] = specs[field];
            }
          });
          
          // Populate pricing fields
          if (pricing) {
            Object.keys(pricing).forEach(pricingField => {
              if (newFormData[pricingField] !== undefined) {
                newFormData[pricingField][hotelName] = pricing[pricingField];
              }
            });
          }
          
          // Populate billing features
          if (billingFeat) {
            setBillingEnabled(billingFeat.billingEnabled);
            setBillingFeatures({
              taxEnabled: billingFeat.taxEnabled,
              discountEnabled: billingFeat.discountEnabled,
              weekendRateEnabled: billingFeat.weekendRateEnabled,
              peakSeasonRateEnabled: billingFeat.peakSeasonRateEnabled,
              securityDepositEnabled: billingFeat.securityDepositEnabled,
              cleaningFeeEnabled: billingFeat.cleaningFeeEnabled,
              extraPersonChargeEnabled: billingFeat.extraPersonChargeEnabled,
              breakfastIncludedEnabled: billingFeat.breakfastIncludedEnabled,
              cancellationPolicyEnabled: billingFeat.cancellationPolicyEnabled,
              minMaxStayEnabled: billingFeat.minMaxStayEnabled
            });
          }
        });
        
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Error fetching hotel specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save all hotel specifications
  const handleSaveAllHotels = async () => {
    try {
      setLoading(true);
      
      // Prepare payload
      const payload = {
        hotelTypes: hotelTypes.map(ht => ({ name: ht.name, active: ht.active })),
        specifications: formData,
        pricing: {
          [hotelTypes[0]?.name]: {
            basePrice: formData.basePrice[hotelTypes[0]?.name] || 0,
            currency: formData.currency[hotelTypes[0]?.name] || 'USD',
            priceUnit: formData.priceUnit[hotelTypes[0]?.name] || 'per night',
            taxRate: formData.taxRate[hotelTypes[0]?.name] || null,
            taxType: formData.taxType[hotelTypes[0]?.name] || null,
            discountPercent: formData.discountPercent[hotelTypes[0]?.name] || null,
            weekendRate: formData.weekendRate[hotelTypes[0]?.name] || null,
            peakSeasonRate: formData.peakSeasonRate[hotelTypes[0]?.name] || null,
            securityDeposit: formData.securityDeposit[hotelTypes[0]?.name] || null,
            cleaningFee: formData.cleaningFee[hotelTypes[0]?.name] || null,
            extraPersonCharge: formData.extraPersonCharge[hotelTypes[0]?.name] || null,
            breakfastPrice: formData.breakfastPrice[hotelTypes[0]?.name] || null,
            refundable: formData.refundable[hotelTypes[0]?.name] || true,
            minStay: formData.minStay[hotelTypes[0]?.name] || 1,
            maxStay: formData.maxStay[hotelTypes[0]?.name] || null
          }
        },
        billingFeatures: billingFeatures
      };
      
      const response = await fetch(`${API_BASE_URL}/hotel-specifications`, {
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
        alert('Hotel specifications saved successfully!');
        
        // Refresh data
        await fetchHotelSpecifications();
      } else {
        alert(result.message || 'Failed to save hotel specifications');
      }
    } catch (error) {
      console.error('Error saving hotel specifications:', error);
      alert('Server error while saving hotel specifications');
    } finally {
      setLoading(false);
    }
  };

  // Options
  const starRatingOptions = ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐', '7⭐'];
  const propertyTypeOptions = ['Hotel', 'Resort', 'Villa', 'Apartment', 'Hostel', 'Boutique Hotel', 'Luxury Resort'];
  const breakfastOptions = ['free', 'paid', 'not available'];
  const roomServiceOptions = ['24x7', 'limited hours', 'not available'];
  const airportTransferOptions = ['paid', 'free', 'not available'];
  const cancellationOptions = ['flexible', 'moderate', 'strict', 'non-refundable'];
  const petPolicyOptions = ['allowed', 'not allowed', 'with charges'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'];
  const priceUnitOptions = ['per night', 'per week', 'per month'];
  const taxTypeOptions = ['gst', 'vat', 'sales tax', 'service tax', 'no tax'];
  const internetSpeedOptions = ['Basic (1-5 Mbps)', 'Standard (5-20 Mbps)', 'High (20-50 Mbps)', 'Premium (50+ Mbps)'];

  // Handle input changes
  const handleInputChange = (hotelName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [hotelName]: value
      }
    }));
  };

  const handleCheckboxChange = (hotelName, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [hotelName]: !prev[field][hotelName]
      }
    }));
  };

  const handleImageUpload = (hotelName, files) => {
    const imageArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      hotelImages: {
        ...prev.hotelImages,
        [hotelName]: [...(prev.hotelImages[hotelName] || []), ...imageArray]
      }
    }));
  };

  const handleRemoveImage = (hotelName, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      hotelImages: {
        ...prev.hotelImages,
        [hotelName]: prev.hotelImages[hotelName].filter((_, idx) => idx !== imageIndex)
      }
    }));
  };

  const handleBulkImageUpload = (files) => {
    setBulkImages(Array.from(files));
  };

  const assignBulkImages = () => {
    // Get selected hotels
    const selectedHotels = Array.from(document.querySelectorAll('input[name="bulk-hotel-select"]:checked'))
      .map(checkbox => checkbox.value);
    
    if (selectedHotels.length === 0) {
      alert('Please select at least one hotel to assign images');
      return;
    }
    
    // Assign images to selected hotels
    const imageArray = bulkImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    const updatedFormData = { ...formData };
    selectedHotels.forEach(hotelName => {
      updatedFormData.hotelImages[hotelName] = [
        ...(updatedFormData.hotelImages[hotelName] || []),
        ...imageArray
      ];
    });
    
    setFormData(updatedFormData);
    setShowBulkImageModal(false);
    setBulkImages([]);
    alert(`Assigned ${bulkImages.length} images to ${selectedHotels.length} hotel(s)`);
  };

  const handleBulkPricingApply = () => {
    if (!billingEnabled) {
      alert('Please enable billing first');
      return;
    }
    
    // Apply bulk pricing to all hotels
    const updatedFormData = { ...formData };
    hotelTypes.forEach(hotel => {
      if (bulkPricing.basePrice) {
        updatedFormData.basePrice[hotel.name] = bulkPricing.basePrice;
      }
      if (bulkPricing.taxRate && billingFeatures.taxEnabled) {
        updatedFormData.taxRate[hotel.name] = bulkPricing.taxRate;
      }
      if (bulkPricing.discount && billingFeatures.discountEnabled) {
        updatedFormData.discountPercent[hotel.name] = bulkPricing.discount;
      }
      if (bulkPricing.weekendRate && billingFeatures.weekendRateEnabled) {
        updatedFormData.weekendRate[hotel.name] = bulkPricing.weekendRate;
      }
      if (bulkPricing.peakSeasonRate && billingFeatures.peakSeasonRateEnabled) {
        updatedFormData.peakSeasonRate[hotel.name] = bulkPricing.peakSeasonRate;
      }
      if (bulkPricing.securityDeposit && billingFeatures.securityDepositEnabled) {
        updatedFormData.securityDeposit[hotel.name] = bulkPricing.securityDeposit;
      }
      if (bulkPricing.cleaningFee && billingFeatures.cleaningFeeEnabled) {
        updatedFormData.cleaningFee[hotel.name] = bulkPricing.cleaningFee;
      }
    });
    
    setFormData(updatedFormData);
    setShowBulkPricingModal(false);
    alert('Bulk pricing applied to all hotels!');
  };

  const openAddHotelModal = () => {
    setNewHotelName('');
    setShowAddHotelModal(true);
  };

  const addNewHotelType = () => {
    if (!newHotelName.trim()) {
      alert('Please enter a hotel name');
      return;
    }

    const hotelName = newHotelName.trim();
    setHotelTypes([...hotelTypes, { id: Date.now(), name: hotelName, active: true }]);
    
    // Initialize form data for new hotel
    setFormData(prev => {
      const newFormData = { ...prev };
      Object.keys(prev).forEach(field => {
        if (typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
          if (field === 'hotelImages') {
            newFormData[field][hotelName] = [];
          } else {
            const firstHotel = Object.keys(prev[field])[0];
            const defaultValue = firstHotel ? 
              (typeof prev[field][firstHotel] === 'boolean' ? false : '') : '';
            newFormData[field][hotelName] = defaultValue;
          }
        }
      });
      return newFormData;
    });

    setShowAddHotelModal(false);
    setNewHotelName('');
  };

  const removeHotelType = (hotelId, hotelName) => {
    if (hotelTypes.length <= 1) {
      alert('You need at least one hotel type');
      return;
    }
    
    setHotelTypes(hotelTypes.filter(v => v.id !== hotelId));
    
    // Remove hotel data from formData
    setFormData(prev => {
      const newFormData = { ...prev };
      Object.keys(prev).forEach(field => {
        if (typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
          delete newFormData[field][hotelName];
        }
      });
      return newFormData;
    });
  };

  const toggleBillingFeature = (feature) => {
    setBillingFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // Calculate total price
  const calculateTotalPrice = (hotelName) => {
    if (!billingEnabled) return '0.00';
    
    const basePrice = parseFloat(formData.basePrice?.[hotelName]) || 0;
    const taxRate = billingFeatures.taxEnabled ? (parseFloat(formData.taxRate?.[hotelName]) || 0) : 0;
    const discount = billingFeatures.discountEnabled ? (parseFloat(formData.discountPercent?.[hotelName]) || 0) : 0;
    const securityDeposit = billingFeatures.securityDepositEnabled ? (parseFloat(formData.securityDeposit?.[hotelName]) || 0) : 0;
    const cleaningFee = billingFeatures.cleaningFeeEnabled ? (parseFloat(formData.cleaningFee?.[hotelName]) || 0) : 0;
    
    const taxAmount = (basePrice * taxRate) / 100;
    const discountAmount = (basePrice * discount) / 100;
    const subtotal = basePrice + taxAmount - discountAmount;
    const total = subtotal + securityDeposit + cleaningFee;
    
    return total.toFixed(2);
  };

  // Table Header Component
  const TableHeader = () => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-2 font-medium text-gray-700">
      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider bg-gray-100 rounded">Features</div>
      {hotelTypes.map(hotel => (
        <div key={hotel.id} className="px-2 py-1.5 bg-indigo-50 rounded-md flex items-center justify-between group">
          <span className="text-[10px] font-semibold truncate">{hotel.name}</span>
          {hotelTypes.length > 1 && (
            <button
              onClick={() => removeHotelType(hotel.id, hotel.name)}
              className="text-red-400 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove hotel"
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
  const renderInputRow = (label, field, type = 'text', options = null) => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
      <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
      {hotelTypes.map(hotel => (
        <div key={hotel.id} className="px-2">
          {type === 'select' ? (
            <select
              value={formData[field]?.[hotel.name] || ''}
              onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              value={formData[field]?.[hotel.name] || ''}
              onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : type === 'currency' ? (
            <div className="flex gap-1">
              <select
                value={formData.currency?.[hotel.name] || 'USD'}
                onChange={(e) => handleInputChange(hotel.name, 'currency', e.target.value)}
                className="w-16 px-1 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currencyOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={formData[field]?.[hotel.name] || ''}
                onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
                placeholder="Amount"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ) : type === 'textarea' ? (
            <textarea
              value={formData[field]?.[hotel.name] || ''}
              onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
              placeholder="Enter"
              rows="2"
              className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          ) : (
            <input
              type="text"
              value={formData[field]?.[hotel.name] || ''}
              onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
              placeholder="Enter"
              className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render a row with checkboxes
  const renderCheckboxRow = (label, field) => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100 last:border-0">
      <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
      {hotelTypes.map(hotel => (
        <div key={hotel.id} className="px-2 flex items-center">
          <input
            type="checkbox"
            checked={formData[field]?.[hotel.name] || false}
            onChange={() => handleCheckboxChange(hotel.name, field)}
            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      ))}
    </div>
  );

  // Render a row with radio buttons
  const renderRadioRow = (label, field, options) => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center hover:bg-gray-50 py-1 border-b border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">{label}</div>
      {hotelTypes.map(hotel => (
        <div key={hotel.id} className="px-2 flex flex-wrap gap-2">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-1">
              <input
                type="radio"
                name={`${field}-${hotel.name}`}
                value={opt}
                checked={formData[field]?.[hotel.name] === opt}
                onChange={(e) => handleInputChange(hotel.name, field, e.target.value)}
                className="w-3 h-3 text-indigo-600"
              />
              <span className="text-[8px]">{opt}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );

  // Render images row
  const renderImagesRow = () => (
    <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-start py-2 border-b border-gray-100">
      <div className="px-2 text-[10px] text-gray-700 font-medium">Hotel Images</div>
      {hotelTypes.map(hotel => (
        <div key={hotel.id} className="px-2">
          <div className="space-y-1">
            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(hotel.name, e.target.files)}
                className="hidden"
                id={`image-upload-${hotel.name}`}
              />
              <span className="block w-full px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[9px] font-medium text-center cursor-pointer hover:bg-indigo-100 border border-indigo-200">
                + Add Images
              </span>
            </label>
            
            {/* Image Previews */}
            {formData.hotelImages?.[hotel.name]?.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {formData.hotelImages[hotel.name].map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img.preview} 
                      alt={`Hotel ${idx}`} 
                      className="w-full h-12 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemoveImage(hotel.name, idx)}
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

  // Render billing feature toggles
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
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Tax</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.discountEnabled}
              onChange={() => toggleBillingFeature('discountEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Discount</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.weekendRateEnabled}
              onChange={() => toggleBillingFeature('weekendRateEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Weekend Rate</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.peakSeasonRateEnabled}
              onChange={() => toggleBillingFeature('peakSeasonRateEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Peak Season Rate</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.securityDepositEnabled}
              onChange={() => toggleBillingFeature('securityDepositEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Security Deposit</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.cleaningFeeEnabled}
              onChange={() => toggleBillingFeature('cleaningFeeEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Cleaning Fee</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.extraPersonChargeEnabled}
              onChange={() => toggleBillingFeature('extraPersonChargeEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Extra Person Charge</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.breakfastIncludedEnabled}
              onChange={() => toggleBillingFeature('breakfastIncludedEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Breakfast</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.cancellationPolicyEnabled}
              onChange={() => toggleBillingFeature('cancellationPolicyEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Cancellation</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={billingFeatures.minMaxStayEnabled}
              onChange={() => toggleBillingFeature('minMaxStayEnabled')}
              className="w-3 h-3 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-[9px] text-gray-600">Min/Max Stay</span>
          </label>
        </div>
      </div>
    );
  };

  // Render total price row
  const renderTotalRow = () => {
    if (!billingEnabled) return null;
    
    return (
      <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-2 items-center py-1 bg-green-50 border-t border-green-200 font-semibold">
        <div className="px-2 text-[10px] text-green-800">Total (inc. fees & tax)</div>
        {hotelTypes.map(hotel => (
          <div key={hotel.id} className="px-2 text-[10px] text-green-800">
            {formData.currency?.[hotel.name] || 'USD'} {calculateTotalPrice(hotel.name)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg mb-4 sticky top-0 z-10">
            <div className="p-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-base font-bold text-gray-800">Hotel Specifications</h1>
                  <p className="text-[10px] text-gray-500 mt-0.5">Configure hotel details and options</p>
                </div>
                
                <div className="flex gap-2">
                  {saveSuccess && (
                    <span className="text-[10px] text-green-600 self-center">✓ Saved successfully!</span>
                  )}
                  <button
                    onClick={() => setShowBulkPricingModal(true)}
                    className="px-3 py-1.5 bg-yellow-500 text-white rounded text-[10px] font-medium hover:bg-yellow-600 flex items-center gap-1"
                    disabled={loading}
                  >
                    <span className="text-xs">💰</span> Bulk Pricing
                  </button>
                  <button
                    onClick={() => setShowBulkImageModal(true)}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded text-[10px] font-medium hover:bg-purple-600 flex items-center gap-1"
                    disabled={loading}
                  >
                    <span className="text-xs">📸</span> Bulk Images
                  </button>
                  <button
                    onClick={openAddHotelModal}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600 flex items-center gap-1"
                    disabled={loading}
                  >
                    <span className="text-xs">+</span> Add Hotel
                  </button>
                  <button 
                    onClick={handleSaveAllHotels}
                    className="px-3 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save All Hotels'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4 text-center">
              <p className="text-[10px] text-gray-500">Loading hotel specifications...</p>
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            {/* 📌 Section 1: Basic Information */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                📌 1. Basic Information
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderInputRow('Hotel Name', 'hotelName', 'text')}
                {renderInputRow('Hotel ID / Code', 'hotelCode', 'text')}
                {renderInputRow('Short Description', 'shortDescription', 'textarea')}
                {renderInputRow('Long Description', 'longDescription', 'textarea')}
                {renderInputRow('Star Rating', 'starRating', 'select', starRatingOptions)}
                {renderInputRow('Property Type', 'propertyType', 'select', propertyTypeOptions)}
                {renderInputRow('Brand / Chain Name', 'brandName', 'text')}
                {renderInputRow('Year Built', 'yearBuilt', 'number')}
                {renderInputRow('Year Renovated', 'yearRenovated', 'number')}
              </div>
            </div>

            {/* 📍 Section 2: Location Details */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                📍 2. Location Details
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderInputRow('Address', 'address', 'textarea')}
                {renderInputRow('City', 'city', 'text')}
                {renderInputRow('State', 'state', 'text')}
                {renderInputRow('Country', 'country', 'text')}
                {renderInputRow('Pin Code', 'pinCode', 'text')}
                {renderInputRow('Latitude', 'latitude', 'text')}
                {renderInputRow('Longitude', 'longitude', 'text')}
                {renderInputRow('Airport Distance (km)', 'airportDistance', 'number')}
                {renderInputRow('Railway Station Distance (km)', 'railwayDistance', 'number')}
                {renderInputRow('Metro Station Distance (km)', 'metroStation', 'number')}
                {renderInputRow('Tourist Attractions', 'touristAttractions', 'textarea')}
              </div>
            </div>

            {/* 🏨 Section 3: Property Facilities */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🏨 3. Property Facilities
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                <h3 className="text-[9px] font-medium text-gray-600 px-2">General Facilities</h3>
                {renderCheckboxRow('24×7 Front Desk', 'frontDesk24x7')}
                {renderCheckboxRow('Elevator / Lift', 'elevator')}
                {renderCheckboxRow('Luggage Storage', 'luggageStorage')}
                {renderCheckboxRow('Power Backup', 'powerBackup')}
                {renderCheckboxRow('ATM / Currency Exchange', 'atmCurrencyExchange')}
                
                <h3 className="text-[9px] font-medium text-gray-600 px-2 mt-2">Leisure Facilities</h3>
                {renderCheckboxRow('Swimming Pool', 'swimmingPool')}
                {renderCheckboxRow('Spa & Wellness', 'spaWellness')}
                {renderCheckboxRow('Gym / Fitness Center', 'gym')}
                {renderCheckboxRow('Garden / Lawn', 'gardenLawn')}
                {renderCheckboxRow('Kids Play Area', 'kidsPlayArea')}
              </div>
            </div>

            {/* 🛏️ Section 4: Room Details */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🛏️ 4. Room Details
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderInputRow('Total Rooms', 'totalRooms', 'number')}
                {renderInputRow('Deluxe Rooms', 'roomTypesDeluxe', 'number')}
                {renderInputRow('Standard Rooms', 'roomTypesStandard', 'number')}
                {renderInputRow('Suite Rooms', 'roomTypesSuite', 'number')}
                {renderInputRow('Family Rooms', 'roomTypesFamily', 'number')}
                {renderInputRow('Room Size', 'roomSize', 'number')}
                {renderInputRow('Room Size Unit', 'roomSizeUnit', 'select', ['sq ft', 'sq m'])}
                {renderInputRow('Bed Type', 'bedType', 'text')}
                {renderInputRow('Occupancy', 'occupancy', 'number')}
                {renderInputRow('Room Amenities', 'roomAmenities', 'textarea')}
              </div>
            </div>

            {/* 🍽️ Section 5: Dining & Food */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🍽️ 5. Dining & Food
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Restaurant (In-house)', 'restaurantInhouse')}
                {renderInputRow('Cuisine Types', 'cuisineTypes', 'textarea')}
                {renderCheckboxRow('Bar / Lounge', 'barLounge')}
                {renderRadioRow('Breakfast Available', 'breakfastAvailable', ['free', 'paid', 'not available'])}
                {renderRadioRow('Room Service', 'roomService', ['24x7', 'limited hours', 'not available'])}
              </div>
            </div>

            {/* 🛎️ Section 6: Services Offered */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🛎️ 6. Services Offered
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Housekeeping', 'housekeeping')}
                {renderCheckboxRow('Laundry Service', 'laundryService')}
                {renderCheckboxRow('Concierge', 'concierge')}
                {renderCheckboxRow('Wake-up Call', 'wakeupCall')}
                {renderRadioRow('Airport Transfer', 'airportTransfer', ['paid', 'free', 'not available'])}
                {renderCheckboxRow('Car Rental', 'carRental')}
              </div>
            </div>

            {/* 🏢 Section 7: Business & Event Facilities */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🏢 7. Business & Event Facilities
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Conference Rooms', 'conferenceRooms')}
                {renderCheckboxRow('Banquet Hall', 'banquetHall')}
                {renderCheckboxRow('Meeting Rooms', 'meetingRooms')}
                {renderCheckboxRow('Projector / AV Equipment', 'projectorAV')}
                {renderCheckboxRow('Event Management Support', 'eventManagement')}
              </div>
            </div>

            {/* 🔐 Section 8: Safety & Security */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🔐 8. Safety & Security
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('CCTV Surveillance', 'cctvSurveillance')}
                {renderCheckboxRow('Security Guards', 'securityGuards')}
                {renderCheckboxRow('Fire Safety Systems', 'fireSafety')}
                {renderCheckboxRow('Smoke Detectors', 'smokeDetectors')}
                {renderCheckboxRow('First Aid Kit', 'firstAid')}
              </div>
            </div>

            {/* 📶 Section 9: Connectivity */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                📶 9. Connectivity
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Free WiFi', 'freeWifi')}
                {renderInputRow('Internet Speed', 'internetSpeed', 'select', internetSpeedOptions)}
                {renderCheckboxRow('Business Center Internet', 'businessCenterInternet')}
              </div>
            </div>

            {/* 🅿️ Section 10: Parking & Transport */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🅿️ 10. Parking & Transport
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Free Parking', 'freeParking')}
                {renderCheckboxRow('Paid Parking', 'paidParking')}
                {renderCheckboxRow('Valet Parking', 'valetParking')}
                {renderCheckboxRow('EV Charging', 'evCharging')}
                {renderCheckboxRow('Shuttle Service', 'shuttleService')}
              </div>
            </div>

            {/* 👨‍👩‍👧 Section 11: Policies */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                👨‍👩‍👧 11. Policies
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderInputRow('Check-in Time', 'checkInTime', 'text')}
                {renderInputRow('Check-out Time', 'checkOutTime', 'text')}
                {renderInputRow('Cancellation Policy', 'cancellationPolicy', 'select', cancellationOptions)}
                {renderInputRow('Child Policy', 'childPolicy', 'textarea')}
                {renderInputRow('Pet Policy', 'petPolicy', 'select', petPolicyOptions)}
                {renderCheckboxRow('ID Proof Required', 'idProofRequired')}
              </div>
            </div>

            {/* 💳 Section 12: Payment Options */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                💳 12. Payment Options
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Cash', 'cash')}
                {renderCheckboxRow('Credit/Debit Card', 'creditCard')}
                {renderCheckboxRow('UPI', 'upi')}
                {renderCheckboxRow('Net Banking', 'netBanking')}
                {renderCheckboxRow('Wallets', 'wallets')}
              </div>
            </div>

            {/* ⭐ Section 13: Reviews & Ratings */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                ⭐ 13. Reviews & Ratings
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderInputRow('Overall Rating', 'overallRating', 'number')}
                {renderInputRow('Review Count', 'reviewCount', 'number')}
                {renderInputRow('Guest Reviews', 'guestReviews', 'textarea')}
                <h3 className="text-[9px] font-medium text-gray-600 px-2 mt-2">Category Ratings</h3>
                {renderInputRow('Cleanliness', 'cleanlinessRating', 'number')}
                {renderInputRow('Location', 'locationRating', 'number')}
                {renderInputRow('Service', 'serviceRating', 'number')}
                {renderInputRow('Value for Money', 'valueForMoneyRating', 'number')}
              </div>
            </div>

            {/* 🌟 Section 14: Accessibility Features */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🌟 14. Accessibility Features
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Wheelchair Access', 'wheelchairAccess')}
                {renderCheckboxRow('Elevator Access', 'elevatorAccess')}
                {renderCheckboxRow('Accessible Rooms', 'accessibleRooms')}
                {renderCheckboxRow('Accessible Washrooms', 'accessibleWashrooms')}
              </div>
            </div>

            {/* 🏆 Section 15: Highlights / Tags */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🏆 15. Highlights / Tags
              </h2>
              <TableHeader />
              <div className="space-y-0.5">
                {renderCheckboxRow('Couple Friendly', 'coupleFriendly')}
                {renderCheckboxRow('Family Friendly', 'familyFriendly')}
                {renderCheckboxRow('Business Friendly', 'businessFriendly')}
                {renderCheckboxRow('Luxury Stay', 'luxuryStay')}
                {renderCheckboxRow('Budget Stay', 'budgetStay')}
              </div>
            </div>

            {/* 💰 Section 16: Billing & Pricing */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-800">💰 16. Billing & Pricing</h2>
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
                    {/* Basic Pricing */}
                    {renderInputRow('Base Price', 'basePrice', 'currency')}
                    {renderInputRow('Price Unit', 'priceUnit', 'select', priceUnitOptions)}
                    
                    {/* Tax */}
                    {billingFeatures.taxEnabled && (
                      <>
                        {renderInputRow('Tax Rate (%)', 'taxRate', 'number')}
                        {renderInputRow('Tax Type', 'taxType', 'select', taxTypeOptions)}
                      </>
                    )}
                    
                    {/* Discount */}
                    {billingFeatures.discountEnabled && (
                      renderInputRow('Discount (%)', 'discountPercent', 'number')
                    )}
                    
                    {/* Weekend Rate */}
                    {billingFeatures.weekendRateEnabled && (
                      renderInputRow('Weekend Rate', 'weekendRate', 'number')
                    )}
                    
                    {/* Peak Season Rate */}
                    {billingFeatures.peakSeasonRateEnabled && (
                      renderInputRow('Peak Season Rate', 'peakSeasonRate', 'number')
                    )}
                    
                    {/* Security Deposit */}
                    {billingFeatures.securityDepositEnabled && (
                      renderInputRow('Security Deposit', 'securityDeposit', 'number')
                    )}
                    
                    {/* Cleaning Fee */}
                    {billingFeatures.cleaningFeeEnabled && (
                      renderInputRow('Cleaning Fee', 'cleaningFee', 'number')
                    )}
                    
                    {/* Extra Person Charge */}
                    {billingFeatures.extraPersonChargeEnabled && (
                      renderInputRow('Extra Person Charge', 'extraPersonCharge', 'number')
                    )}
                    
                    {/* Breakfast Price */}
                    {billingFeatures.breakfastIncludedEnabled && (
                      renderInputRow('Breakfast Price', 'breakfastPrice', 'number')
                    )}
                    
                    {/* Cancellation Policy */}
                    {billingFeatures.cancellationPolicyEnabled && (
                      <>
                        {renderCheckboxRow('Refundable', 'refundable')}
                      </>
                    )}
                    
                    {/* Min/Max Stay */}
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

            {/* Images Section */}
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                🖼️ Hotel Images
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
          </div>
        </div>
      </div>

      {/* Add Hotel Modal */}
      {showAddHotelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Add New Hotel</h3>
                <button
                  onClick={() => setShowAddHotelModal(false)}
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
                Hotel Name
              </label>
              <input
                type="text"
                value={newHotelName}
                onChange={(e) => setNewHotelName(e.target.value)}
                placeholder="e.g., Grand Hyatt, Marriott"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-[8px] text-gray-500 mt-2">
                Enter a unique name for this hotel
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-[10px] font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addNewHotelType}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600"
              >
                Add Hotel
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
                    <p className="text-[10px] font-medium text-gray-700 mb-2">Assign to Hotels:</p>
                    <div className="flex flex-wrap gap-3">
                      {hotelTypes.map(hotel => (
                        <label key={hotel.id} className="flex items-center gap-1">
                          <input 
                            type="checkbox" 
                            name="bulk-hotel-select"
                            value={hotel.name}
                            className="w-3 h-3" 
                          />
                          <span className="text-[10px]">{hotel.name}</span>
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
                Apply same pricing to all hotels
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              {billingFeatures.securityDepositEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.securityDeposit}
                    onChange={(e) => setBulkPricing({...bulkPricing, securityDeposit: e.target.value})}
                    placeholder="Enter security deposit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              {billingFeatures.cleaningFeeEnabled && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Cleaning Fee
                  </label>
                  <input
                    type="number"
                    value={bulkPricing.cleaningFee}
                    onChange={(e) => setBulkPricing({...bulkPricing, cleaningFee: e.target.value})}
                    placeholder="Enter cleaning fee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                Apply to All Hotels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSpecificationsForm;