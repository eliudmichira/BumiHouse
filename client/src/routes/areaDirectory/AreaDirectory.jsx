import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Building2, MapPin, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProperties } from '../../hooks/useProperties';
import { getAreasFromProperties } from '../../utils/popularAreas';
import AreaImageCarousel from '../../components/AreaImageCarousel';

const AreaDirectory = () => {
  const { isDark } = useTheme();
  const { data, isLoading } = useProperties();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('count'); // 'count' | 'az'

  const allAreas = useMemo(() => getAreasFromProperties(data?.properties || []), [data]);

  const visibleAreas = useMemo(() => {
    let list = allAreas;
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q));
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allAreas, query, sort]);

  const totalListings = useMemo(() => allAreas.reduce((sum, a) => sum + a.count, 0), [allAreas]);

  const handleAreaClick = (area) => {
    window.location.href = `/properties?search=${encodeURIComponent(area)}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-wide uppercase bg-[#51faaa]/10 text-[#51faaa] border border-[#51faaa]/20">
            <MapPin className="w-3.5 h-3.5" />
            Area Directory
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Explore{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Every Area
            </span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            {isLoading
              ? 'Loading neighborhoods…'
              : `${allAreas.length} neighborhoods across Kenya · ${totalListings} listings`}
          </p>
        </div>

        {/* Search + sort controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10 max-w-2xl mx-auto">
          <div className={`relative flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search areas, e.g. Westlands or Kitengela…"
              className={`w-full pl-12 pr-10 py-3.5 rounded-2xl text-sm outline-none transition-all border ${
                isDark
                  ? 'bg-[#10121e] border-gray-700/60 focus:border-[#51faaa]/50 focus:shadow-lg focus:shadow-[#51faaa]/10'
                  : 'bg-white border-gray-200 focus:border-[#51faaa]/60 focus:shadow-lg focus:shadow-[#51faaa]/10'
              }`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className={`flex rounded-2xl p-1 text-xs font-semibold border ${
            isDark ? 'bg-[#10121e] border-gray-700/60' : 'bg-white border-gray-200'
          }`}>
            {[
              { value: 'count', label: 'Most listings' },
              { value: 'az', label: 'A–Z' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  sort === opt.value
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow'
                    : `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Areas grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : visibleAreas.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {visibleAreas.map((area) => (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area.name)}
                className={`group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#51faaa]/10 focus:outline-none focus:ring-2 focus:ring-[#51faaa]/50 ${
                  isDark ? 'bg-[#10121e]' : 'bg-white'
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <AreaImageCarousel images={area.images} name={area.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-semibold">
                    {area.count} listing{area.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className={`flex items-center justify-between px-3 pt-3 pb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-base md:text-lg font-semibold">{area.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#51faaa] opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No areas match "{query}"</p>
            <p className="text-sm mt-1">Try a different search or clear the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaDirectory;
