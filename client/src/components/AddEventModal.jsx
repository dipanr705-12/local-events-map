import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Search,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  User,
  Globe,
} from 'lucide-react';
import { CATEGORIES, DEFAULT_PRESET_IMAGES } from '../utils/constants';
import { geocodeSearch } from '../utils/api';

export default function AddEventModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultCoordinates = { lat: 12.9716, lng: 77.5946 },
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech & AI',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    endDate: '',
    endTime: '21:00',
    venue: '',
    address: '',
    latitude: defaultCoordinates.lat.toFixed(4),
    longitude: defaultCoordinates.lng.toFixed(4),
    description: '',
    price: 'Free',
    organizer: '',
    website: '',
    imageUrl: DEFAULT_PRESET_IMAGES[0].url,
  });

  const [errors, setErrors] = useState({});
  const [addressQuery, setAddressQuery] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressResults, setAddressResults] = useState([]);

  const miniMapContainerRef = useRef(null);
  const miniMapRef = useRef(null);
  const miniMarkerRef = useRef(null);

  // Initialize mini map when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      if (!miniMapRef.current) {
        const initialLat = parseFloat(formData.latitude) || defaultCoordinates.lat;
        const initialLng = parseFloat(formData.longitude) || defaultCoordinates.lng;

        const map = L.map(miniMapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 13,
          minZoom: 4,
          maxBounds: [[6.0, 68.0], [38.0, 98.0]],
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setFormData((prev) => ({
            ...prev,
            latitude: pos.lat.toFixed(4),
            longitude: pos.lng.toFixed(4),
          }));
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setFormData((prev) => ({
            ...prev,
            latitude: e.latlng.lat.toFixed(4),
            longitude: e.latlng.lng.toFixed(4),
          }));
        });

        miniMapRef.current = map;
        miniMarkerRef.current = marker;
      } else {
        miniMapRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (!isOpen && miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        miniMarkerRef.current = null;
      }
    };
  }, [isOpen]);

  // Update marker if lat/lng inputs change manually
  const updateMapMarker = (lat, lng) => {
    if (miniMapRef.current && miniMarkerRef.current && !isNaN(lat) && !isNaN(lng)) {
      miniMarkerRef.current.setLatLng([lat, lng]);
      miniMapRef.current.setView([lat, lng], 13);
    }
  };

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!addressQuery.trim()) return;

    setIsSearchingAddress(true);
    try {
      const data = await geocodeSearch(addressQuery);
      setAddressResults(data.results || []);
    } catch {
      setAddressResults([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const selectAddressResult = (result) => {
    setFormData((prev) => ({
      ...prev,
      address: result.displayName,
      latitude: result.lat.toFixed(4),
      longitude: result.lng.toFixed(4),
    }));
    updateMapMarker(result.lat, result.lng);
    setAddressResults([]);
    setAddressQuery('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'latitude' || name === 'longitude') {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
      const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);
      updateMapMarker(lat, lng);
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Client-side pre-validation
    const clientErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      clientErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      clientErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.venue.trim()) {
      clientErrors.venue = 'Venue name is required';
    }
    if (!formData.address.trim()) {
      clientErrors.address = 'Address is required';
    }
    if (!formData.date) {
      clientErrors.date = 'Date is required';
    }
    const latVal = parseFloat(formData.latitude);
    if (isNaN(latVal)) {
      clientErrors.latitude = 'Valid latitude is required';
    } else if (latVal < 6.0 || latVal > 38.0) {
      clientErrors.latitude = 'Latitude must be within India (6.0° to 38.0°)';
    }

    const lngVal = parseFloat(formData.longitude);
    if (isNaN(lngVal)) {
      clientErrors.longitude = 'Valid longitude is required';
    } else if (lngVal < 68.0 || lngVal > 98.0) {
      clientErrors.longitude = 'Longitude must be within India (68.0° to 98.0°)';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      onClose();
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ general: err.message || 'Failed to submit event' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Host a Local Event</h3>
              <p className="text-xs text-slate-500">Share your meetup, show, or gathering on the map</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitForm} className="overflow-y-auto p-6 space-y-5 flex-1">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Bengaluru Sunset Acoustic Jam & Music Sessions"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admission / Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Free or ₹499"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Venue & Location Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Location & Venue</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Indiranagar Tech Hub / Carter Rd Amphitheatre"
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                    errors.venue ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 100 Feet Rd, Indiranagar, Bengaluru, Karnataka"
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                    errors.address ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>

            {/* Address Autocomplete / Geocoding helper */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  placeholder="Search address in India to set coordinates..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearchingAddress}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearchingAddress ? 'Searching...' : 'Search'}</span>
                </button>
              </div>

              {addressResults.length > 0 && (
                <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-xs">
                  {addressResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectAddressResult(r)}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center justify-between"
                    >
                      <span className="truncate">{r.displayName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">Click to set</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Mini Map Picker */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>💡 Tip: Click on map or drag the marker to adjust exact event pin</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {formData.latitude}, {formData.longitude}
                  </span>
                </p>
                <div
                  ref={miniMapContainerRef}
                  className="w-full h-44 rounded-lg border border-slate-300 bg-slate-200 overflow-hidden"
                />
              </div>

              {/* Coordinate inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="What makes this event special? Mention what to expect, who should attend, and any guidelines."
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.description ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Image & Preset Covers */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Cover Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Preset thumbnails */}
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Or pick a quick category cover:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DEFAULT_PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                    className={`relative w-14 h-10 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      formData.imageUrl === preset.url
                        ? 'border-indigo-600 scale-105 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organizer / Host Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="e.g. Local Community Club"
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Website / Tickets Link
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
