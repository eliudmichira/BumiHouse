import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MapPin, X, RotateCcw } from 'lucide-react';

const DrawToSearch = ({ onDrawComplete, isDrawingMode, onCancel }) => {
  const map = useMap();
  const drawingManagerRef = useRef(null);
  const polygonRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingSupported, setIsDrawingSupported] = useState(false);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    // Check if DrawingManager is available
    if (!window.google.maps.drawing || !window.google.maps.drawing.DrawingManager) {
      setIsDrawingSupported(false);
      return;
    }

    setIsDrawingSupported(true);

    // Initialize Drawing Manager
    try {
      drawingManagerRef.current = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
          strokeWeight: 2,
          strokeColor: '#3B82F6',
          clickable: true,
          editable: true,
          zIndex: 1
        }
      });

      drawingManagerRef.current.setMap(map);

      // Listen for polygon completion
      window.google.maps.event.addListener(
        drawingManagerRef.current,
        'polygoncomplete',
        (polygon) => {
          polygonRef.current = polygon;
          setIsDrawing(false);
          
          // Get polygon coordinates
          const path = polygon.getPath();
          const coordinates = [];
          for (let i = 0; i < path.getLength(); i++) {
            const vertex = path.getAt(i);
            coordinates.push({
              lat: vertex.lat(),
              lng: vertex.lng()
            });
          }
          
          // Call callback with polygon coordinates
          if (onDrawComplete) {
            onDrawComplete(coordinates);
          }
        }
      );
    } catch (error) {
      console.error('Error initializing DrawingManager:', error);
      setIsDrawingSupported(false);
    }

    return () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
      }
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
    };
  }, [map, onDrawComplete]);

  // Handle drawing mode toggle
  useEffect(() => {
    if (!drawingManagerRef.current || !isDrawingSupported) return;

    if (isDrawingMode && !isDrawing) {
      try {
        drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
        setIsDrawing(true);
      } catch (error) {
        console.error('Error setting drawing mode:', error);
        setIsDrawing(false);
      }
    } else if (!isDrawingMode) {
      try {
        drawingManagerRef.current.setDrawingMode(null);
        setIsDrawing(false);
      } catch (error) {
        console.error('Error clearing drawing mode:', error);
      }
    }
  }, [isDrawingMode, isDrawing, isDrawingSupported]);

  const handleClearDrawing = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (onDrawComplete) {
      onDrawComplete(null);
    }
  };

  // Don't render if drawing is not supported
  if (!isDrawingSupported) {
    return null;
  }

  if (!isDrawingMode) return null;

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {isDrawing ? 'Click to draw your search area' : 'Draw search area'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearDrawing}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Clear drawing"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Cancel drawing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawToSearch; 