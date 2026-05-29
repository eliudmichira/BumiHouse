import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Heart, MessageCircle } from "lucide-react";

function Card({property}){
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/80 border border-white/30 dark:border-dark-700 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
      <div className="relative">
        <Link to={`/${property.id}`}>
          <img 
            src={property.img} 
            alt={property.title}
            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-600 transition-colors duration-300">
            <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-600 transition-colors duration-300">
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
          <Link to={`/${property.id}`}>{property.title}</Link>
        </h2>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{property.address}</span>
        </div>

        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
          Ksh {property.price.toLocaleString()}/month
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedroom} bed</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathroom} bath</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card