import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import EventCard from './components/EventCard';
import MapView from './components/MapView';
import EventModal from './components/EventModal';
import AddEventModal from './components/AddEventModal';
import EmptyState from './components/EmptyState';
import LoadingSkeleton from './components/LoadingSkeleton';
import {
  fetchEvents,
  fetchCategories,
  fetchConfig,
  createEvent,
  deleteEvent,
  resetSeedData,
} from './utils/api';
import { INDIAN_CITIES, DEFAULT_INDIA_CENTER } from './utils/constants';
import { ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Data state
  const [events, setEvents] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [config, setConfig] = useState({
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    defaultCenter: DEFAULT_INDIA_CENTER,
  });

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(INDIAN_CITIES[0]); // 'All India'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('all');
  const [radius, setRadius] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('local_events_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI & Interaction state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('list'); // 'list' | 'map'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('local_events_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Load configuration and category metadata on mount
  useEffect(() => {
    fetchConfig()
      .then((cfg) => setConfig(cfg))
      .catch((err) => console.warn('Config fetch fallback:', err));

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      const counts = {};
      data.categories.forEach((c) => {
        counts[c.name] = c.count;
      });
      setCategoryCounts(counts);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Fetch events based on current filters
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        search,
        category: selectedCategory,
        dateRange,
        radius: radius || undefined,
        sortBy,
      };

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      if (showFavoritesOnly) {
        if (favorites.length === 0) {
          setEvents([]);
          setIsLoading(false);
          return;
        }
        params.favorites = favorites.join(',');
      }

      const data = await fetchEvents(params);
      let list = data.events || [];

      // Filter by selected Indian city if specific city chosen
      if (selectedCity && selectedCity.name !== 'All India') {
        const cityKey = selectedCity.name === 'Delhi NCR' ? 'delhi' : selectedCity.name.toLowerCase();
        list = list.filter((ev) => {
          const inAddress = (ev.address || '').toLowerCase().includes(cityKey);
          const inVenue = (ev.venue || '').toLowerCase().includes(cityKey);
          const inTitle = (ev.title || '').toLowerCase().includes(cityKey);
          return inAddress || inVenue || inTitle;
        });
      }

      setEvents(list);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Unable to connect to events server');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCity, selectedCategory, dateRange, radius, userLocation, sortBy, showFavoritesOnly, favorites]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 200);

    return () => clearTimeout(timer);
  }, [loadEvents]);

  // Toggle favorite status
  const handleToggleFavorite = (eventId) => {
    setFavorites((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Geolocation trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
        // Default to 25km radius in India if none set
        if (!radius) setRadius('25');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback demo coordinates (Bengaluru, India)
        setUserLocation({
          lat: 12.9716,
          lng: 77.5946,
        });
        setLocationError('Defaulted to Bengaluru (browser location was denied or unavailable)');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setRadius('');
    setLocationError(null);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCity(INDIAN_CITIES[0]);
    setSelectedCategory('All');
    setDateRange('all');
    setRadius('');
    setUserLocation(null);
    setShowFavoritesOnly(false);
    setLocationError(null);
  };

  // Handle Event Selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Handle Create Event
  const handleCreateEvent = async (formData) => {
    setIsSubmitting(true);
    try {
      await createEvent(formData);
      await loadEvents();
      await loadCategories();
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setSelectedEvent(null);
      setIsDetailModalOpen(false);
      await loadEvents();
      await loadCategories();
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    }
  };

  // Handle Reset Seed
  const handleResetSeed = async () => {
    if (confirm('Reset database with original sample events across India?')) {
      setIsResetting(true);
      try {
        await resetSeedData();
        await loadEvents();
        await loadCategories();
      } catch (err) {
        alert('Failed to reset sample data: ' + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Header */}
      <Navbar
        onAddEventClick={() => setIsAddModalOpen(true)}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
      />

      {/* Filter & Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        radius={radius}
        onRadiusChange={setRadius}
        userLocation={userLocation}
        onGetLocation={handleGetLocation}
        onClearLocation={handleClearLocation}
        isLocating={isLocating}
        locationError={locationError}
        categoryCounts={categoryCounts}
        onResetFilters={handleResetFilters}
        totalResults={events.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={loadEvents}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 2-Column Split: Events List (Left) and Interactive Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Event List (Hidden on mobile if user chose 'map' tab) */}
          <div
            className={`lg:col-span-6 xl:col-span-7 flex flex-col space-y-4 ${
              activeMobileTab === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* List Header & Sorting */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {showFavoritesOnly
                    ? 'Saved Favorites'
                    : selectedCity.name !== 'All India'
                    ? `Events in ${selectedCity.name}`
                    : 'Upcoming Events in India'}
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {events.length} {events.length === 1 ? 'event' : 'events'}
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="date">Date (Earliest first)</option>
                  {userLocation && <option value="distance">Proximity (Nearest first)</option>}
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* List Body */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : events.length === 0 ? (
              <EmptyState
                type={showFavoritesOnly ? 'no-favorites' : 'no-results'}
                onReset={showFavoritesOnly ? () => setShowFavoritesOnly(false) : handleResetFilters}
                onAddEvent={() => setIsAddModalOpen(true)}
              />
            ) : (
              <div className="space-y-3.5">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent?.id === event.id}
                    onSelect={handleSelectEvent}
                    isFavorite={favorites.includes(event.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onHover={setHoveredEventId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Map (Hidden on mobile if user chose 'list' tab) */}
          <div
            className={`lg:col-span-6 xl:col-span-5 sticky top-20 ${
              activeMobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="h-[75vh] min-h-[460px] max-h-[820px] rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              <MapView
                events={events}
                selectedEvent={selectedEvent}
                hoveredEventId={hoveredEventId}
                onSelectEvent={handleSelectEvent}
                userLocation={userLocation}
                radius={radius}
                selectedCity={selectedCity}
                tileUrl={config.tileUrl}
                attribution={config.attribution}
                onLocateMe={handleGetLocation}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isFavorite={selectedEvent ? favorites.includes(selectedEvent.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Add New Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEvent}
        isSubmitting={isSubmitting}
        defaultCoordinates={
          userLocation ||
          (selectedCity && selectedCity.name !== 'All India'
            ? { lat: selectedCity.lat, lng: selectedCity.lng }
            : { lat: 12.9716, lng: 77.5946 })
        }
      />
    </div>
  );
}
