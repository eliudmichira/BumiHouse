import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Upload, 
  Save, 
  X, 
  Plus,
  Home,
  Store,
  Landmark,
  Camera,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { propertiesAPI, agentsAPI, storageAPI } from '../../lib/firebaseAPI';

// Google Maps Geocoding API key
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

// Toast notification system
const showToast = (options) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out`;
  
  toast.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${
      options.type === 'error' 
        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' 
        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
    } text-white shadow-2xl backdrop-blur-xl border border-white/20">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]"></div>
      </div>
      
      <!-- Content -->
      <div class="relative flex items-start gap-4">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/60 animate-[progress_4s_linear]"></div>
      </div>
    </div>
  `;
  
  // Add custom CSS for progress animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initial position (off-screen)
  toast.style.transform = 'translateX(120%) scale(0.8)';
  toast.style.opacity = '0';
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.opacity = '1';
  }, 50);
  
  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(120%) scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 500);
  }, 4000);
};

const AddProperty = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Helper function to get user ID that works with both property structures
  const getUserId = () => {
    return currentUser?.id || currentUser?.uid;
  };

  // Helper function to get user avatar that works with both property structures
  const getUserAvatar = () => {
    return currentUser?.avatar || currentUser?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
  };

  // Helper function to get user name that works with both property structures
  const getUserName = () => {
    return currentUser?.name || currentUser?.displayName || '';
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    status: 'for-sale',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      // New: allow users to paste a Google Maps link (pin)
      googleMapsLink: '',
      coordinates: { lat: '', lng: '' }
    },
    details: {
      bedrooms: '',
      bathrooms: '',
      area: '',
      parking: '',
      yearBuilt: '',
      floors: ''
    },
    amenities: [],
    images: [],
    contact: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      whatsapp: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [geocoding, setGeocoding] = useState(false);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          name: currentUser.name || '',
          email: currentUser.email || ''
        }
      }));
    }
  }, [currentUser]);

  // Load property for editing if query param present: /properties/add?edit=:id
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    setIsEdit(true);
    setEditingId(editId);
    (async () => {
      try {
        const property = await propertiesAPI.getById(editId);
        // Map property data into form shape
        setFormData({
          title: property.title || '',
          description: property.description || '',
          price: property.price != null ? String(property.price) : '',
          propertyType: property.type || '',
          status: property.status || 'for-sale',
          location: {
            address: property.location?.address || '',
            city: property.location?.city || '',
            state: property.location?.state || '',
            zipCode: property.location?.zipCode || '',
            googleMapsLink: property.location?.googleMapsLink || '',
            coordinates: property.location?.coordinates || { lat: '', lng: '' }
          },
          details: {
            bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
            bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
            area: property.area != null ? String(property.area) : '',
            parking: property.parking != null ? String(property.parking) : '',
            yearBuilt: property.yearBuilt != null ? String(property.yearBuilt) : '',
            floors: property.floors != null ? String(property.floors) : ''
          },
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
          images: Array.isArray(property.images) ? property.images : [],
          contact: {
            name: property.contact?.name || currentUser?.name || '',
            email: property.contact?.email || currentUser?.email || '',
            phone: property.contact?.phone || '',
            whatsapp: property.contact?.whatsapp || ''
          }
        });
        // Previews from existing images
        if (Array.isArray(property.images)) {
          setPreviewImages(property.images.map(url => ({ file: null, url })));
        }
      } catch (e) {
        console.error('Failed to load property for edit:', e);
      }
    })();
  }, [searchParams]);

  const propertyTypes = [
    { value: 'house', label: 'House', icon: Home },
    { value: 'apartment', label: 'Apartment', icon: Building2 },
    { value: 'commercial', label: 'Commercial', icon: Store },
    { value: 'land', label: 'Land', icon: Landmark }
  ];

  // Professionally grouped amenities (ordered as requested)
  const amenityGroups = [
    {
      title: '🛠 Utilities & Essentials',
      items: [
        { value: 'reliable-water', label: 'Reliable Water Supply (City/Borehole) 💧' },
        { value: 'backup-power', label: 'Backup Generator/Power Inverter ⚡' },
        { value: 'secure-compound', label: 'Secure Compound (CCTV + Guards) 🔒' },
        { value: 'garbage-collection', label: 'Garbage Collection ♻️' },
        { value: 'fibre-internet', label: 'Fibre Internet 🌐' },
        { value: 'wifi', label: 'WiFi 📶' },
      ]
    },
    {
      title: '🏢 Apartment Features',
      items: [
        { value: 'ensuite-bedrooms', label: 'En-suite Bedrooms 🛏' },
        { value: 'modern-kitchen', label: 'Modern Kitchen (Open/Closed) 🍳' },
        { value: 'spacious-balcony', label: 'Spacious Balcony/Outdoor Space 🌿' },
        { value: 'laundry-area', label: 'Laundry Area (Washer Connection) 🧺' },
        { value: 'water-heater', label: 'Water Heater/Instant Showers 🚿' },
        { value: 'dsq', label: 'Servant Quarters (DSQ) 👩‍🍳' },
        { value: 'elevator', label: 'Lift/Elevator 🛗' },
        { value: 'ample-parking', label: 'Ample Parking 🚗' },
      ]
    },
    {
      title: '🌟 Comfort & Lifestyle',
      items: [
        { value: 'gym', label: 'Gym 💪' },
        { value: 'swimming-pool', label: 'Swimming Pool 🏊' },
        { value: 'garden-lawns', label: 'Garden/Lawns 🌱' },
        { value: 'clubhouse', label: 'Clubhouse/Community Hall 🏠' },
        { value: 'play-area', label: "Children's Play Area 🛝" },
      ]
    }
  ];
  const amenities = amenityGroups.flatMap(group => group.items);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length + imageFiles.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs (for new files)
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, { file, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    // Also remove from persisted images when removing preview
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Property title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.location.address.trim()) newErrors['location.address'] = 'Address is required';
    if (!formData.location.city.trim()) newErrors['location.city'] = 'City is required';
    if (!formData.details.bedrooms) newErrors['details.bedrooms'] = 'Number of bedrooms is required';
    if (!formData.details.bathrooms) newErrors['details.bathrooms'] = 'Number of bathrooms is required';
    if (!formData.details.area) newErrors['details.area'] = 'Property area is required';
    // Require coordinates unless a Google Maps link was provided
    const hasMapsLink = !!formData.location.googleMapsLink;
    const lat = formData.location.coordinates?.lat;
    const lng = formData.location.coordinates?.lng;
    if (!hasMapsLink && (!lat || !lng)) {
      newErrors['location.coordinates'] = 'Coordinates are required (use Geocode or enter manually)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Extract coordinates from a Google Maps URL
  const parseLatLngFromGoogleMapsUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
      // Common patterns:
      // 1) .../@-1.2345,36.7890,17z
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return { lat: atMatch[1], lng: atMatch[2] };
      }
      // 2) .../maps?q=-1.2345,36.7890 or ?q=lat,lng
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        return { lat: qMatch[1], lng: qMatch[2] };
      }
      // 3) .../place/.../data=!3m1!1e3?hl=en&ll=-1.2345,36.7890 (ll param)
      const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        return { lat: llMatch[1], lng: llMatch[2] };
      }
      // 4) maps.google.com/?saddr=&daddr=lat,lng
      const daddrMatch = url.match(/[?&]daddr=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (daddrMatch) {
        return { lat: daddrMatch[1], lng: daddrMatch[2] };
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  const handleMapsLinkChange = (value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, googleMapsLink: value }
    }));
    const parsed = parseLatLngFromGoogleMapsUrl(value);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, googleMapsLink: value, coordinates: { lat: String(parsed.lat), lng: String(parsed.lng) } }
      }));
      if (errors['location.coordinates']) {
        setErrors(prev => ({ ...prev, ['location.coordinates']: '' }));
      }
      showToast({ type: 'success', title: 'Coordinates detected', message: `Lat/Lng auto-filled from link` });
    }
  };

  const handleCoordChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [key]: value
        }
      }
    }));
    if (errors['location.coordinates']) {
      setErrors(prev => ({ ...prev, ['location.coordinates']: '' }));
    }
  };

  const handleGeocode = async () => {
    try {
      setGeocoding(true);
      // 1) If a Google Maps link is present, parse it and use those exact coords
      if (formData.location.googleMapsLink) {
        const parsed = parseLatLngFromGoogleMapsUrl(formData.location.googleMapsLink);
        if (parsed) {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, coordinates: { lat: String(parsed.lat), lng: String(parsed.lng) } }
          }));
          showToast({ type: 'success', title: 'Coordinates detected', message: 'Filled from Google Maps link.' });
          return;
        }
      }

      // 2) Otherwise, geocode the typed address (bias to Kenya for better accuracy)
      const parts = [
        formData.location.address,
        formData.location.city,
        formData.location.state,
        formData.location.zipCode,
        'Kenya'
      ].filter(Boolean).join(', ');
      if (!parts) {
        showToast({ type: 'error', title: 'Missing address', message: 'Enter address/city before geocoding.' });
        return;
      }
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(parts)}&region=ke&components=country:KE&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'OK' || !data.results?.length) {
        showToast({ type: 'error', title: 'Geocoding failed', message: data.error_message || 'No results found for the address.' });
        return;
      }
      const { lat, lng } = data.results[0].geometry.location;
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, coordinates: { lat: String(lat), lng: String(lng) } }
      }));
      showToast({ type: 'success', title: 'Location found', message: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` });
    } catch (e) {
      console.error('Geocode error:', e);
      showToast({ type: 'error', title: 'Geocoding error', message: 'Unable to fetch coordinates. Try again.' });
    } finally {
      setGeocoding(false);
    }
  };


    const { mutate: addProperty, isLoading } = useMutation({
      mutationFn: (formData) => addPropertyFunction(formData),
      onSuccess: () => {
        console.log("Property added successfully!");
      },
      onError: (error) => {
        console.error("Error adding property:", error.message);
      },
    });
    
   

   const saveData = async(formData) =>{
    try {
      // Check if user is authenticated
      if (!currentUser || !currentUser.id) {
        throw new Error('User must be authenticated to add a property. Please log in and try again.');
      }
      
      // Transform form data to match Firebase structure
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        type: formData.propertyType,
        status: formData.status,
        location: {
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
          zipCode: formData.location.zipCode,
          coordinates: formData.location.coordinates
        },
        bedrooms: parseInt(formData.details.bedrooms),
        bathrooms: parseInt(formData.details.bathrooms),
        area: parseInt(formData.details.area),
        parking: formData.details.parking,
        yearBuilt: formData.details.yearBuilt,
        floors: formData.details.floors,
        amenities: formData.amenities,
        images: formData.images,
        contact: formData.contact,
        userId: currentUser.id, // Add userId for dashboard queries
        agent: {
          id: currentUser.id, // Add the agent ID
          name: formData.contact.name,
          email: formData.contact.email,
          phone: formData.contact.phone,
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        views: 0,
        rating: 0,
        reviews: 0,
        featured: false,
        createdAt: new Date() // Add creation timestamp
      };
      
      // Create or update agent record
      const agentData = {
        id: currentUser.id,
        name: formData.contact.name,
        email: formData.contact.email,
        phone: formData.contact.phone,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        specialization: 'General',
        experience: '5+ years',
        propertiesSold: 0,
        rating: 4.5,
        bio: 'Professional real estate agent'
      };
      
      await agentsAPI.createOrUpdate(agentData);
      
      const result = await propertiesAPI.create(propertyData);
      return result;
    } catch (error) {
      console.error('Error saving property to Firebase:', error);
      throw error;
    }
   }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting property data:', formData);
      console.log('Current user state:', currentUser);
      console.log('Current user ID:', currentUser?.id);
      console.log('Current user UID:', currentUser?.uid);
      console.log('getUserId() result:', getUserId());
      
      // Upload new image files to storage, keep existing URLs
      const existingUrls = Array.isArray(formData.images) ? formData.images.filter(Boolean) : [];
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        const timeStamp = Date.now();
        const uploads = imageFiles.map(async (file, idx) => {
          // Skip if this preview already references a persisted URL (edit mode)
          if (!file) return null;
          const path = `properties/${currentUser.id}/${timeStamp}_${idx}_${file.name}`;
          const url = await storageAPI.uploadImage(file, path);
          return url;
        });
        const results = await Promise.all(uploads);
        uploadedUrls = results.filter(Boolean);
      }

      const allImages = [...existingUrls, ...uploadedUrls];

      // If editing, update; else create
      let result;
      if (isEdit && editingId) {
        // Build property payload same as create
        const payload = await (async () => {
          return {
            title: formData.title,
            description: formData.description,
            price: parseInt(formData.price),
            type: formData.propertyType,
            status: formData.status,
            location: {
              address: formData.location.address,
              city: formData.location.city,
              state: formData.location.state,
              zipCode: formData.location.zipCode,
              coordinates: formData.location.coordinates
            },
            bedrooms: parseInt(formData.details.bedrooms),
            bathrooms: parseInt(formData.details.bathrooms),
            area: parseInt(formData.details.area),
            parking: formData.details.parking,
            yearBuilt: formData.details.yearBuilt,
            floors: formData.details.floors,
            amenities: formData.amenities,
            images: allImages,
            contact: formData.contact,
            userId: currentUser.id,
            agent: {
              id: currentUser.id,
              name: formData.contact.name,
              email: formData.contact.email,
              phone: formData.contact.phone,
              avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
            }
          };
        })();
        result = await propertiesAPI.update(editingId, payload);
      } else {
        // Save to Firebase (create)
        const createdPayload = {
          ...formData,
          price: parseInt(formData.price),
          type: formData.propertyType,
          bedrooms: parseInt(formData.details.bedrooms),
          bathrooms: parseInt(formData.details.bathrooms),
          area: parseInt(formData.details.area),
          images: allImages,
        };
        result = await saveData({ ...formData, images: allImages });
      }
      console.log('Property saved successfully:', result);
      
      // Show success toast
      showToast({
        type: 'success',
        title: isEdit ? 'Property Updated Successfully!' : 'Property Added Successfully!',
        message: isEdit ? `"${formData.title}" changes have been saved.` : `"${formData.title}" has been added to your listings.`
      });
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard?section=my-properties');
      }, 2000);
    } catch (error) {
      console.error('Error adding property:', error);
      
      // Show specific error messages based on error type
      let errorMessage = 'Failed to add property. Please try again.';
      
      if (error.message.includes('User must be authenticated')) {
        errorMessage = 'You must be logged in to add a property. Please log in and try again.';
      } else if (error.message.includes('Agent ID is required')) {
        errorMessage = 'Authentication error. Please log out and log back in, then try again.';
      } else if (error.message.includes('permission-denied')) {
        errorMessage = 'You do not have permission to add properties. Please contact support.';
      }
      
      showToast({
        type: 'error',
        title: 'Error Adding Property',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All data will be lost.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                {isEdit ? 'Edit Property' : 'Add New Property'}
              </h1>
              <p className={`font-outfit text-lg ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                {isEdit ? 'Update your listing details and save changes' : 'Create a new property listing with detailed information'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                    : 'text-gray-600 hover:text-[#51faaa] hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              {isEdit && (
                <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  Editing: {editingId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#51faaa]" />
              </div>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    errors.title 
                      ? 'border-red-500' 
                      : isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter property title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    errors.propertyType 
                      ? 'border-red-500' 
                      : isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.propertyType && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors.propertyType}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Price (KES) *
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors.price 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.price && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                  errors.description 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Describe the property, its features, and what makes it special..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#51faaa]" />
              </div>
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    errors['location.address'] 
                      ? 'border-red-500' 
                      : isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter full address"
                />
                {errors['location.address'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['location.address']}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    errors['location.city'] 
                      ? 'border-red-500' 
                      : isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter city"
                />
                {errors['location.city'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['location.city']}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  State/County
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter state or county"
                />
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter ZIP code"
                />
              </div>

              {/* Coordinates */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Google Maps link or Pin (paste URL)
                </label>
                <input
                  type="text"
                  value={formData.location.googleMapsLink}
                  onChange={(e) => handleMapsLinkChange(e.target.value)}
                  placeholder="e.g. https://maps.app.goo.gl/... or a Google Maps place URL"
                  className={`w-full px-4 py-3 mb-4 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Coordinates fields */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                    Coordinates (Latitude, Longitude) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${geocoding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Geocode from address"
                  >
                    {geocoding ? 'Finding…' : 'Geocode address'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.location.coordinates?.lat}
                    onChange={(e) => handleCoordChange('lat', e.target.value)}
                    placeholder="Latitude (e.g. -1.2921)"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors['location.coordinates'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={formData.location.coordinates?.lng}
                    onChange={(e) => handleCoordChange('lng', e.target.value)}
                    placeholder="Longitude (e.g. 36.8219)"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors['location.coordinates'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                {errors['location.coordinates'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['location.coordinates']}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#51faaa]" />
              </div>
              Property Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Bedrooms *
                </label>
                <div className="relative">
                  <Bed className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    value={formData.details.bedrooms}
                    onChange={(e) => handleInputChange('details.bedrooms', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors['details.bedrooms'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors['details.bedrooms'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['details.bedrooms']}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    value={formData.details.bathrooms}
                    onChange={(e) => handleInputChange('details.bathrooms', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors['details.bathrooms'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors['details.bathrooms'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['details.bathrooms']}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Area (sq ft) *
                </label>
                <div className="relative">
                  <Square className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    value={formData.details.area}
                    onChange={(e) => handleInputChange('details.area', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      errors['details.area'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors['details.area'] && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2 font-outfit">
                    <AlertCircle className="w-4 h-4" />
                    {errors['details.area']}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Parking Spaces
                </label>
                <div className="relative">
                  <Car className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    value={formData.details.parking}
                    onChange={(e) => handleInputChange('details.parking', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                      isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.details.yearBuilt}
                  onChange={(e) => handleInputChange('details.yearBuilt', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Year"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Floors
                </label>
                <input
                  type="number"
                  value={formData.details.floors}
                  onChange={(e) => handleInputChange('details.floors', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Number of floors"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Amenities
            </h2>
            
            {/* Grouped display order */}
            <div className="space-y-6">
              {amenityGroups.map((group) => (
                <div key={group.title}>
                  <h4 className={`text-sm font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{group.title}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.items.map((amenity) => (
                      <label key={amenity.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity.value)}
                          onChange={() => handleAmenityToggle(amenity.value)}
                          className={`w-4 h-4 rounded focus:ring-2 focus:ring-[#51faaa] ${
                            isDark 
                              ? 'text-[#51faaa] bg-[#0a0c19] border-[rgba(81,250,170,0.3)] focus:ring-offset-[#0a0c19]' 
                              : 'text-[#51faaa] bg-white border-gray-300 focus:ring-offset-white'
                          }`}
                        />
                        <span className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#51faaa]" />
              </div>
              Property Images
            </h2>
            
            <div className="space-y-4">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDark 
                  ? 'border-[rgba(81,250,170,0.3)]' 
                  : 'border-gray-300'
              }`}>
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                <p className={`mb-2 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-600'
                }`}>
                  Upload property images (max 10 images, 5MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300 cursor-pointer font-outfit font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Choose Images
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
            <h2 className={`text-xl font-outfit font-semibold mb-6 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact.name}
                  onChange={(e) => handleInputChange('contact.name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={`block text-sm font-outfit font-medium mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.contact.whatsapp}
                  onChange={(e) => handleInputChange('contact.whatsapp', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-3 rounded-xl transition-colors font-outfit font-semibold ${
                isDark 
                  ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                  : 'text-gray-600 hover:text-[#51faaa] hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-outfit font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                  {isEdit ? 'Saving Changes...' : 'Adding Property...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Add Property'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty; 