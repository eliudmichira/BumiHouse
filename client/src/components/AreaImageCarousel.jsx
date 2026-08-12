import React, { useState, useEffect } from 'react';
import { handleImageError } from '../utils/imageUtils';

// Auto-cycling photo carousel for area cards — crossfades through the area's
// photos with a slow Ken Burns zoom, dot indicators, and pause-on-hover.
// The `areaKenburns` keyframes live in src/index.css (defined once).
const AreaImageCarousel = ({ images, name }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused, images.length]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={i === 0 ? name : ''}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'
            }`}
          style={i === index ? { animation: 'areaKenburns 10s ease-in-out infinite alternate' } : undefined}
          onError={handleImageError}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setIndex(i); } }}
              className={`cursor-pointer rounded-full transition-all duration-300 ${i === index ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaImageCarousel;
