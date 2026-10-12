import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Locate, Maximize2, Layers } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

// Helper to create category-colored SVG pin marker icon
function createCustomPin(category, isSelected, isHovered) {
  const color = CATEGORY_COLORS[category] || '#6366f1';
  const scale = isSelected ? 'scale(1.28)' : isHovered ? 'scale(1.18)' : 'scale(1)';
  const zIndex = isSelected ? 9999 : isHovered ? 999 : 100;

  const html = `
    <div style="position: relative; width: 34px; height: 34px; transform: ${scale}; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: ${zIndex};">
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-event-pin',
    html: html,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function createUserPin() {
  return L.divIcon({
    className: 'user-pin-wrapper',
    html: `<div class="user-location-pin"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function MapView({
  events = [],
  selectedEvent,
  hoveredEventId,
  onSelectEvent,
  userLocation,
  radius,
  selectedCity,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution = '&copy; OpenStreetMap contributors',
  onLocateMe,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const radiusCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const indiaBounds = [
      [6.0, 68.0],
      [38.0, 98.0],
    ];

    const initialCenter = userLocation
      ? [userLocation.lat, userLocation.lng]
      : selectedCity
      ? [selectedCity.lat, selectedCity.lng]
      : [20.5937, 78.9629]; // India Center

    const initialZoom = userLocation ? 12 : selectedCity ? selectedCity.zoom : 5;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 4,
      maxBounds: indiaBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    });

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle fly to selected city
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCity) return;
    map.flyTo([selectedCity.lat, selectedCity.lng], selectedCity.zoom, { duration: 1 });
  }, [selectedCity]);

  // Update Markers when events change or selection/hover changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous event markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      const isSelected = selectedEvent?.id === event.id;
      const isHovered = hoveredEventId === event.id;
      const icon = createCustomPin(event.category, isSelected, isHovered);

      const marker = L.marker([event.latitude, event.longitude], {
        icon,
        title: event.title,
        zIndexOffset: isSelected ? 1000 : isHovered ? 500 : 0,
      }).addTo(map);

      // Popup
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 2px; max-width: 220px;">
          <div style="font-size: 11px; font-weight: 700; color: ${CATEGORY_COLORS[event.category] || '#4f46e5'}; text-transform: uppercase;">
            ${event.category}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; line-height: 1.25;">
            ${event.title}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
            📍 ${event.venue}
          </div>
          <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px;">
            🗓️ ${event.date} • ${event.time}
          </div>
          <button id="view-popup-btn-${event.id}" style="
            margin-top: 8px;
            width: 100%;
            background: #4f46e5;
            color: #ffffff;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-popup-btn-${event.id}`);
        if (btn) {
          btn.onclick = () => onSelectEvent(event);
        }
      });

      marker.on('click', () => {
        onSelectEvent(event);
      });

      markersRef.current[event.id] = marker;
    });
  }, [events, selectedEvent?.id, hoveredEventId]);

  // Center on selected event when it changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedEvent) return;

    if (selectedEvent.latitude && selectedEvent.longitude) {
      map.setView([selectedEvent.latitude, selectedEvent.longitude], 14, {
        animate: true,
      });

      const marker = markersRef.current[selectedEvent.id];
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedEvent?.id]);

  // Handle user location and radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // User marker
    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserPin(),
          zIndexOffset: 2000,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }

      // Radius circle
      if (radius && !isNaN(parseFloat(radius))) {
        const radiusMeters = parseFloat(radius) * 1000;
        if (!radiusCircleRef.current) {
          radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
            radius: radiusMeters,
            color: '#4f46e5',
            fillColor: '#6366f1',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 6',
          }).addTo(map);
        } else {
          radiusCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
          radiusCircleRef.current.setRadius(radiusMeters);
        }
      } else if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
    }
  }, [userLocation, radius]);

  // Fit bounds to all events
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || events.length === 0) return;

    const validCoordinates = events
      .filter((e) => e.latitude && e.longitude)
      .map((e) => [e.latitude, e.longitude]);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-xs bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            title="Locate my position"
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-md border border-slate-200 transition-all active:scale-95"
          >
            <Locate className="w-4 h-4 text-indigo-600" />
          </button>
        )}

        {events.length > 0 && (
          <button
            onClick={handleFitBounds}
            title="Fit all events in view"
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-md border border-slate-200 transition-all active:scale-95"
          >
            <Maximize2 className="w-4 h-4 text-slate-700" />
          </button>
        )}
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm text-[11px] text-slate-600">
        <span className="font-semibold text-slate-800">Events:</span>
        <span>{events.length} pins</span>
        {userLocation && (
          <>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-indigo-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Your location</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
