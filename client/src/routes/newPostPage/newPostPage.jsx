import { useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  DollarSign, 
  MapPin, 
  FileText, 
  Building, 
  Bed, 
  Bath, 
  Navigation, 
  Globe, 
  Type, 
  Zap, 
  Dog, 
  DollarSign as IncomeIcon, 
  Ruler, 
  GraduationCap, 
  Bus, 
  Utensils, 
  Camera, 
  Plus, 
  X, 
  Map,
  ArrowLeft,
  Save
} from "lucide-react";
import { useTheme } from '../../context/ThemeContext';

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const isDark = (theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom),
          bathroom: parseInt(inputs.bathroom),
          type: inputs.type,
          property: inputs.property,
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          images: images,
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities,
          pet: inputs.pet,
          income: inputs.income,
          size: parseInt(inputs.size),
          school: parseInt(inputs.school),
          bus: parseInt(inputs.bus),
          restaurant: parseInt(inputs.restaurant),
        },
      });
      navigate("/" + res.data.id);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please enable location services in your browser settings to continue.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("Location information is unavailable. Try again later.");
          } else if (error.code === error.TIMEOUT) {
            alert("The request to get your location timed out.");
          } else {
            alert("An unknown error occurred while requesting location.");
          }
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-300">
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
              <div className="absolute top-0 -right-20 w-96 h-96 bg-gradient-to-r from-teal-400 via-green-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
            </>
          ) : (
            <>
              <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
              <div className="absolute top-0 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-4 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Add New Property
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create a compelling listing to attract potential tenants or buyers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/70 border border-white/30 dark:border-dark-700/30 shadow-2xl rounded-3xl p-8 transition-colors duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Property Title
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="title" 
                          name="title" 
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter property title"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="price" 
                          name="price" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="address" 
                          name="address" 
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        City
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="city" 
                          name="city" 
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bedroom" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Bedrooms
                      </label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="bedroom" 
                          name="bedroom" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Number of bedrooms"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bathroom" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Bathrooms
                      </label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="bathroom" 
                          name="bathroom" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Number of bathrooms"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="desc" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                      {/* <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        className="bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl overflow-hidden transition-colors duration-300"
                        style={{ minHeight: '120px' }}
                      /> */}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Latitude
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="latitude" 
                          name="latitude" 
                          type="number" 
                          step="any"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter latitude"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Get Current Location
                      </button>
                    </div>

                    <div>
                      <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Longitude
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="longitude" 
                          name="longitude" 
                          type="number" 
                          step="any"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter longitude"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Type
                      </label>
                      <div className="relative">
                        <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <select 
                          id="type" 
                          name="type" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none dark:text-gray-100"
                        >
                          <option value="">Select type</option>
                          <option value="buy">Buy</option>
                          <option value="rent">Rent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="property" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Property Type
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <select 
                          id="property" 
                          name="property" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none dark:text-gray-100"
                        >
                          <option value="">Select property type</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="condo">Condo</option>
                          <option value="land">Land</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="utilities" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Utilities
                      </label>
                      <div className="relative">
                        <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <select 
                          id="utilities" 
                          name="utilities" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none dark:text-gray-100"
                        >
                          <option value="">Select utilities</option>
                          <option value="owner">Owner</option>
                          <option value="tenant">Tenant</option>
                          <option value="shared">Shared</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pet" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Pet Policy
                      </label>
                      <div className="relative">
                        <Dog className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <select 
                          id="pet" 
                          name="pet" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none dark:text-gray-100"
                        >
                          <option value="">Select pet policy</option>
                          <option value="allowed">Allowed</option>
                          <option value="not_allowed">Not Allowed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="income" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Income
                      </label>
                      <div className="relative">
                        <IncomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="income" 
                          name="income" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter income"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Size
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="size" 
                          name="size" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter size"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="school" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        School
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="school" 
                          name="school" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter school rating"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bus" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Bus
                      </label>
                      <div className="relative">
                        <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="bus" 
                          name="bus" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter bus rating"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="restaurant" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Restaurant
                      </label>
                      <div className="relative">
                        <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                          id="restaurant" 
                          name="restaurant" 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-dark-900/80 border border-white/30 dark:border-dark-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter restaurant rating"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      {isSubmitting ? "Creating..." : "Create Post"}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/70 border border-white/30 dark:border-dark-700/30 shadow-2xl rounded-3xl p-6 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Property Images</h3>
                </div>
                <UploadWidget
                  uwConfig={{
                    cloudName: "dpgcldst5",
                    uploadPreset: "estate",
                    multiple: true,
                    maxImageFileSize: 2000000,
                    folder: "posts",
                  }}
                  onUpload={(result) => {
                    setImages((prev) => [...prev, result.info.secure_url]);
                  }}
                />
              </div>

              {/* Uploaded Images */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/70 border border-white/30 dark:border-dark-700/30 shadow-2xl rounded-3xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Uploaded Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Button */}
              <button
                onClick={() => setShowMapModal(true)}
                className="w-full backdrop-blur-xl bg-white/70 dark:bg-dark-800/70 border border-white/30 dark:border-dark-700/30 shadow-2xl rounded-3xl p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Set Location</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click to set property location on map</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Property Location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {/* Map component would go here */}
              <div className="h-96 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Map component will be integrated here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewPostPage;
