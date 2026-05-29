import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search, MapPin, Home, Building2, DollarSign, Bed, Filter as FilterIcon } from "lucide-react";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    property: searchParams.get("property") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedroom: searchParams.get("bedroom") || ""
  });

  const handleChange = (e) => {
    setQuery({
      ...query,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleFilter = () => {
    setSearchParams(query);
  };

  const clearFilters = () => {
    setQuery({
      type: "",
      city: "",
      property: "",
      minPrice: "",
      maxPrice: "",
      bedroom: ""
    });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Search results for{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {searchParams.get("city") || "Properties"}
          </span>
        </h2>
        <p className="text-gray-600">Refine your search to find the perfect property</p>
      </div>

      {/* Search Form */}
      <div className="space-y-6">
        {/* Location Input */}
        <div className="relative">
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Enter city or location"
              value={query.city}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              Type
            </label>
            <div className="relative">
              <select 
                name="type" 
                id="type" 
                value={query.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
              >
                <option value="">Any Type</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label htmlFor="property" className="block text-sm font-semibold text-gray-700 mb-2">
              Property
            </label>
            <div className="relative">
              <select 
                name="property" 
                id="property" 
                value={query.property}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
              >
                <option value="">Any Property</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="house">House</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bedroom Filter */}
          <div>
            <label htmlFor="bedroom" className="block text-sm font-semibold text-gray-700 mb-2">
              Bedrooms
            </label>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="bedroom"
                id="bedroom"
                type="number"
                placeholder="Any"
                value={query.bedroom}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="minPrice"
                id="minPrice"
                type="number"
                placeholder="0"
                value={query.minPrice}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="maxPrice"
                id="maxPrice"
                type="number"
                placeholder="1000000"
                value={query.maxPrice}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={handleFilter}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Search Properties
          </button>
          
          <button 
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default Filter;
