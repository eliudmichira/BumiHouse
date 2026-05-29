import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { X, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { db, auth, storage, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { propertiesAPI, agentsAPI, storageAPI } from '../../lib/firebaseAPI';
import { motion, AnimatePresence } from 'framer-motion';

// Step Components
import StepBasics from '../components/addProperty/StepBasics';
import StepLocation from '../components/addProperty/StepLocation';
import StepDetails from '../components/addProperty/StepDetails';
import StepAmenities from '../components/addProperty/StepAmenities';
import StepMedia from '../components/addProperty/StepMedia';
import StepReview from '../components/addProperty/StepReview';

// Google Maps Geocoding API key
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

// Toast notification helper
const showToast = (options) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transform transition-all duration-500 ease-out w-[90%] max-w-[400px]`;

    toast.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-4 ${options.type === 'error'
            ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
            : options.type === 'warning'
                ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600'
                : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
        } text-white shadow-2xl backdrop-blur-xl border border-white/20">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          ${options.type === 'error' ? '!' : '✓'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-0.5">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

const MobileAddProperty = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { currentUser } = useAuth();
    const { isDark } = useTheme();

    // Wizard State
    // Steps: Basics, Location, Details, Amenities, Media, Review
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

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
        hasMultipleUnits: false, // Feature for multi-unit properties
        units: [], // Array of unit objects
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
    const [resolvingUrl, setResolvingUrl] = useState(false);

    // Update form data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    name: currentUser.name || prev.contact.name,
                    email: currentUser.email || prev.contact.email
                }
            }));
        }
    }, [currentUser]);

    // Load property for editing
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (!editId) return;
        setIsEdit(true);
        setEditingId(editId);
        (async () => {
            try {
                const property = await propertiesAPI.getById(editId);
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
                if (Array.isArray(property.images)) {
                    setPreviewImages(property.images.map(url => ({ file: null, url })));
                }
            } catch (e) {
                console.error('Failed to load property for edit:', e);
            }
        })();
    }, [searchParams]);

    // Handlers
    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
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
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length + imageFiles.length > 10) {
            showToast({ type: 'error', title: 'Limit Reached', message: 'Maximum 10 images allowed' });
            return;
        }

        setImageFiles(prev => [...prev, ...validFiles]);

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
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Geocoding Logic
    const parseLatLngFromGoogleMapsUrl = async (url) => {
        if (!url) return null;
        const cleanUrl = url.trim();

        // 1. Direct Coordinate String (e.g. "-1.283, 36.821" or "1.2, 3.4")
        const coordMatch = cleanUrl.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            return { lat: coordMatch[1], lng: coordMatch[2] };
        }

        // 2. Google Maps URL Patterns
        const latLngRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const placeRegex = /place\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const queryRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;

        let match = cleanUrl.match(latLngRegex) || cleanUrl.match(placeRegex) || cleanUrl.match(queryRegex);

        if (match) {
            return { lat: match[1], lng: match[2] };
        }

        // If it's a short URL, call the cloud function to resolve it
        if (cleanUrl.includes('maps.app.goo.gl') || cleanUrl.includes('goo.gl/maps')) {
            try {
                const resolveUrl = httpsCallable(functions, 'resolveShortUrl');
                const result = await resolveUrl({ url: cleanUrl });
                const resolvedUrl = result.data.resolvedUrl;

                if (resolvedUrl && resolvedUrl !== cleanUrl) {
                    // Try parsing the resolved URL
                    match = resolvedUrl.match(latLngRegex) || resolvedUrl.match(placeRegex) || resolvedUrl.match(queryRegex);
                    if (match) {
                        return { lat: match[1], lng: match[2] };
                    }
                }
            } catch (err) {
                console.error('Error resolving short URL:', err);
            }
        }

        return null;
    };

    const handleMapsLinkChange = async (value) => {
        setFormData(prev => ({
            ...prev, location: { ...prev.location, googleMapsLink: value }
        }));

        // If it's a URL, try to parse it immediately
        if (value.trim() && (value.includes('maps.app.goo.gl') || value.includes('goo.gl/maps') || value.includes('google.com/maps'))) {
            setResolvingUrl(true);
            const parsed = await parseLatLngFromGoogleMapsUrl(value);
            setResolvingUrl(false);
            if (parsed) {
                setFormData(prev => ({
                    ...prev, location: { ...prev.location, coordinates: { lat: parsed.lat, lng: parsed.lng } }
                }));
                showToast({ type: 'success', title: 'Location Found', message: `Coords: ${parsed.lat}, ${parsed.lng}` });
                if (errors['location.coordinates']) setErrors(prev => ({ ...prev, ['location.coordinates']: '' }));
            }
        }
    };

    const handleGeocode = async () => {
        setGeocoding(true);
        try {
            let query = '';

            // Priority 1: Check if the "Link" field has a Plus Code or raw address
            const linkField = formData.location.googleMapsLink?.trim();
            if (linkField && !linkField.includes('http')) {
                // Treat as Plus Code or Place Name
                query = linkField;
            }
            // Priority 2: Construct from Address fields
            else {
                // Include State/County for better precision
                query = [formData.location.address, formData.location.city, formData.location.state, 'Kenya'].filter(Boolean).join(', ');
            }

            if (!query) {
                showToast({ type: 'error', title: 'Missing Info', message: 'Enter an address or map code.' });
                setGeocoding(false);
                return;
            }

            // If it IS a URL, we should have already tried parsing it in handleMapsLinkChange. 
            // But if the user clicked "Geocode Address", let's try parsing again just in case.
            if (linkField && linkField.includes('http')) {
                const parsed = await parseLatLngFromGoogleMapsUrl(linkField);
                if (parsed) {
                    setFormData(prev => ({
                        ...prev, location: { ...prev.location, coordinates: { lat: parsed.lat, lng: parsed.lng } }
                    }));
                    showToast({ type: 'success', title: 'Used Map Link', message: 'Coords extracted.' });
                    setGeocoding(false);
                    return;
                }
            }

            // Geocoding API Call - Added components=country:KE for strict filtering
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&components=country:KE&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.results?.[0]) {
                const { lat, lng } = data.results[0].geometry.location;
                setFormData(prev => ({
                    ...prev, location: { ...prev.location, coordinates: { lat: String(lat), lng: String(lng) } }
                }));
                showToast({ type: 'success', title: 'Found', message: `Location: ${data.results[0].formatted_address || query}` });
                if (errors['location.coordinates']) setErrors(prev => ({ ...prev, ['location.coordinates']: '' }));
            } else {
                showToast({ type: 'error', title: 'Not Found', message: 'Could not find location.' });
            }
        } catch {
            showToast({ type: 'error', title: 'Error', message: 'Geocoding failed.' });
        } finally {
            setGeocoding(false);
        }
    };

    // Validation
    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        switch (step) {
            case 1: // Basics
                if (!formData.title.trim()) newErrors.title = 'Title required';
                if (!formData.propertyType) newErrors.propertyType = 'Type required';
                // Only validate price if NOT multi-unit
                if (!formData.hasMultipleUnits && !formData.price) newErrors.price = 'Price required';
                if (!formData.description.trim()) newErrors.description = 'Description required';
                break;
            case 2: // Location
                if (!formData.location.address.trim()) newErrors['location.address'] = 'Address required';
                if (!formData.location.city.trim()) newErrors['location.city'] = 'City required';
                const hasMapsLink = !!formData.location.googleMapsLink;
                const lat = formData.location.coordinates?.lat;
                const lng = formData.location.coordinates?.lng;
                if (!hasMapsLink && (!lat || !lng)) {
                    newErrors['location.coordinates'] = 'Coords or Map Link required';
                }
                break;
            // Add other steps validation if needed
            default:
                break;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            showToast({ type: 'error', title: 'Incomplete', message: 'Please fill all required fields.' });
        } else {
            setErrors({});
        }
        return isValid;
    };

    const containerRef = React.useRef(null);

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            if (containerRef.current) containerRef.current.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        if (containerRef.current) containerRef.current.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Upload images
            const existingUrls = Array.isArray(formData.images) ? formData.images.filter(Boolean) : [];
            let uploadedUrls = [];
            if (imageFiles.length > 0) {
                const timeStamp = Date.now();
                for (let idx = 0; idx < imageFiles.length; idx++) {
                    try {
                        const path = `properties/${currentUser.id}/${timeStamp}_${idx}_${imageFiles[idx].name}`;
                        const url = await storageAPI.uploadImage(imageFiles[idx], path);
                        uploadedUrls.push(url);
                    } catch (err) {
                        console.error('Upload failed', err);
                    }
                }
            }
            const allImages = [...existingUrls, ...uploadedUrls];

            const finalData = { ...formData, images: allImages };

            // Calculate Price for Multi-Unit (Lowest Price "Starting From")
            let finalPrice = parseInt(finalData.price);
            if (finalData.hasMultipleUnits && finalData.units?.length > 0) {
                const prices = finalData.units.map(u => Number(u.price)).filter(p => !isNaN(p) && p > 0);
                if (prices.length > 0) {
                    finalPrice = Math.min(...prices);
                }
            }

            // Logic to save/update
            const propertyData = {
                title: finalData.title,
                description: finalData.description,
                price: finalPrice || 0, // Ensure price is set
                type: finalData.propertyType,
                status: finalData.status,
                location: finalData.location,
                bedrooms: parseInt(finalData.details.bedrooms || 0),
                bathrooms: parseInt(finalData.details.bathrooms || 0),
                area: parseInt(finalData.details.area || 0),
                parking: finalData.details.parking,
                yearBuilt: finalData.details.yearBuilt,
                floors: finalData.details.floors,
                amenities: finalData.amenities,
                images: finalData.images, // Updated images
                hasMultipleUnits: finalData.hasMultipleUnits,
                units: finalData.hasMultipleUnits ? finalData.units : [],
                contact: finalData.contact,
                userId: currentUser.id,
                agent: {
                    id: currentUser.id,
                    name: finalData.contact.name,
                    email: finalData.contact.email,
                    phone: finalData.contact.phone,
                    avatar: currentUser?.avatar
                },
                createdAt: new Date()
            };

            if (isEdit && editingId) {
                await propertiesAPI.update(editingId, { ...propertyData, price: parseInt(propertyData.price) });
            } else {
                await propertiesAPI.create(propertyData);
                // Ensure agent is created/updated
                await agentsAPI.createOrUpdate(propertyData.agent);
            }

            showToast({ type: 'success', title: 'Success', message: 'Property saved successfully!' });
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Error', message: 'Failed to save property.' });
        } finally {
            setLoading(false);
        }
    };

    // Progress Bar Calculation
    const progress = (currentStep / totalSteps) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepBasics formData={formData} handleInputChange={handleInputChange} errors={errors} />;
            case 2:
                return <StepLocation
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleMapsLinkChange={handleMapsLinkChange}
                    handleGeocode={handleGeocode}
                    geocoding={geocoding}
                    resolvingUrl={resolvingUrl}
                    errors={errors}
                />;
            case 3:
                return <StepDetails formData={formData} handleInputChange={handleInputChange} />;
            case 4:
                return <StepAmenities formData={formData} handleAmenityToggle={handleAmenityToggle} />;
            case 5:
                return <StepMedia
                    previewImages={previewImages}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                />;
            case 6:
                return <StepReview formData={formData} />;
            default:
                return null;
        }
    };

    return (
        <div ref={containerRef} className={`fixed inset-0 z-[60] overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`fixed left-0 right-0 z-[70] px-4 py-4 backdrop-blur-md ${isDark ? 'bg-[#0a0c19]/90 border-b border-white/10' : 'bg-white/90 border-b border-gray-200'}`} style={{ top: 'max(0px, env(safe-area-inset-top, 0px))' }}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className={`p-2 rounded-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <X className="w-6 h-6" />
                    </button>
                    <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {isEdit ? 'Edit Property' : 'Add Property'}
                    </h1>
                    <div className="w-10"></div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#3b82f6]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs font-bold text-gray-500">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span>{
                        currentStep === 1 ? 'Basics' :
                            currentStep === 2 ? 'Location' :
                                currentStep === 3 ? 'Details' :
                                    currentStep === 4 ? 'Amenities' :
                                        currentStep === 5 ? 'Media' : 'Review'
                    }</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-32 pb-32 px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md ${isDark ? 'bg-[#0a0c19]/90 border-t border-white/10' : 'bg-white/90 border-t border-gray-200'} z-[70]`} style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
                <div className="flex gap-3">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                        >
                            <ChevronLeft className="w-5 h-5" /> Back
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button
                            onClick={handleNext}
                            className={`flex-[2] py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] flex items-center justify-center gap-2 shadow-lg hover:shadow-[#3b82f6]/20`}
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex-[2] py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] flex items-center justify-center gap-2 shadow-lg hover:shadow-[#3b82f6]/20 disabled:opacity-70`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {isEdit ? 'Save Changes' : 'Submit Property'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileAddProperty;
