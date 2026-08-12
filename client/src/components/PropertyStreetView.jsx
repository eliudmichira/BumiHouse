import React, { useEffect, useRef, useState } from 'react';
import { Camera, Navigation, MapPin } from 'lucide-react';
import { getNormalizedLatLng } from '../utils/locationUtils';
import { useTheme } from '../context/ThemeContext';

/**
 * PropertyMediaTabs
 * Segmented control: "Photos" (renders children) / "Street View" (renders StreetViewPanorama).
 * Uses raw window.google.maps.StreetViewPanorama constructor + StreetViewService
 * to check coverage and avoid requiring a parent <GoogleMap>.
 *
 * Props:
 *  - property: object that may contain latitude/longitude or nested coordinates
 *  - heightClass: tailwind height classes to keep container constant between tabs
 *  - children: photos gallery content (rendered when Photos tab is active)
 *  - variant: 'desktop' | 'mobile' (affects radius styling)
 */
export default function PropertyMediaTabs({ property, heightClass, children, variant = 'desktop' }) {
  const { isDark } = useTheme();
  // Try direct lat/lng fields first, then fall back to normalized lookup.
  const directLat = typeof property?.latitude === 'number' ? property.latitude : null;
  const directLng = typeof property?.longitude === 'number' ? property.longitude : null;
  const normalized = (directLat != null && directLng != null)
    ? { lat: directLat, lng: directLng }
    : getNormalizedLatLng(property);

  const hasCoords = !!(normalized && Number.isFinite(normalized.lat) && Number.isFinite(normalized.lng));

  const [tab, setTab] = useState('photos');
  const containerRef = useRef(null);
  const panoramaRef = useRef(null);
  const [coverageState, setCoverageState] = useState('idle'); // idle | checking | ok | none | error

  const radius = variant === 'mobile' ? 'rounded-2xl' : 'rounded-2xl';

  // Mount / teardown the StreetViewPanorama when Street View tab is active.
  useEffect(() => {
    if (tab !== 'streetview' || !hasCoords) return;
    const g = typeof window !== 'undefined' ? window.google : null;
    if (!g || !g.maps || !g.maps.StreetViewPanorama || !g.maps.StreetViewService) {
      setCoverageState('error');
      return;
    }

    let cancelled = false;
    setCoverageState('checking');
    const service = new g.maps.StreetViewService();
    service.getPanorama(
      { location: { lat: normalized.lat, lng: normalized.lng }, radius: 100 },
      (data, status) => {
        if (cancelled) return;
        if (status === 'OK' && data?.location?.latLng && containerRef.current) {
          setCoverageState('ok');
          try {
            panoramaRef.current = new g.maps.StreetViewPanorama(containerRef.current, {
              position: data.location.latLng,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              addressControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
              panControl: true,
              zoomControl: true,
              linksControl: true,
              enableCloseButton: false,
              visible: true,
            });
          } catch (e) {
            setCoverageState('error');
          }
        } else {
          setCoverageState('none');
        }
      }
    );

    return () => {
      cancelled = true;
      if (panoramaRef.current) {
        try { panoramaRef.current.setVisible(false); } catch {}
        panoramaRef.current = null;
      }
      if (containerRef.current) {
        // Clear the Google-injected DOM so a re-mount starts clean.
        containerRef.current.innerHTML = '';
      }
    };
  }, [tab, hasCoords, normalized?.lat, normalized?.lng]);

  const switchTo = (next) => {
    if (next === 'streetview' && !hasCoords) return;
    setTab(next);
  };

  const pillBase = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200';
  const activeCls = 'bg-[#3dd88a] text-white shadow-sm';
  const inactiveCls = isDark
    ? 'bg-slate-800 text-slate-350 hover:bg-slate-700 border border-slate-700'
    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200';
  const disabledCls = isDark
    ? 'bg-slate-850 text-slate-600 border border-slate-800/80 cursor-not-allowed'
    : 'bg-white text-slate-300 border border-slate-200 cursor-not-allowed';

  return (
    <div className="w-full">
      {/* Segmented Control */}
      <div className="mb-3 flex items-center">
        <div className={`inline-flex items-center gap-1 p-1 rounded-full border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => switchTo('photos')}
            className={`${pillBase} ${tab === 'photos' ? activeCls : inactiveCls}`}
            aria-pressed={tab === 'photos'}
          >
            <Camera className="w-4 h-4" />
            Photos
          </button>
          <button
            type="button"
            onClick={() => switchTo('streetview')}
            disabled={!hasCoords}
            title={!hasCoords ? 'Location unknown' : undefined}
            className={`${pillBase} ${
              !hasCoords ? disabledCls : tab === 'streetview' ? activeCls : inactiveCls
            }`}
            aria-pressed={tab === 'streetview'}
          >
            <Navigation className="w-4 h-4" />
            Street View
          </button>
        </div>
      </div>

      {/* Constant-height container */}
      <div className={`relative w-full ${heightClass} ${radius} overflow-hidden`}>
        {/* Photos layer */}
        <div className={`${tab === 'photos' ? 'block' : 'hidden'} w-full h-full`}>
          {children}
        </div>

        {/* Street View layer */}
        <div className={`${tab === 'streetview' ? 'block' : 'hidden'} w-full h-full`}>
          {coverageState === 'none' || coverageState === 'error' ? (
            <div className={`w-full h-full border flex items-center justify-center p-6 ${radius} ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center max-w-sm">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <MapPin className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Street View not available</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No Street View imagery exists near this property location.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div ref={containerRef} className="w-full h-full" />
              {coverageState === 'checking' && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                  isDark ? 'bg-slate-950/80' : 'bg-white/80'
                }`}>
                  <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading Street View…</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
