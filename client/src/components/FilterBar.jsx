import React from 'react';
import { Search, Calendar, Compass, Navigation, X, MapPin } from 'lucide-react';
import { CATEGORIES, DATE_FILTER_OPTIONS, DISTANCE_OPTIONS, INDIAN_CITIES } from '../utils/constants';

export default function FilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  dateRange,
  onDateRangeChange,
  radius,
  onRadiusChange,
  userLocation,
  onGetLocation,
  onClearLocation,
  isLocating,
  locationError,
  categoryCounts = {},
  onResetFilters,
  totalResults,
  selectedCity,
  onSelectCity,
}) {
  const isFiltered = Boolean(
    search ||
    (selectedCategory && selectedCategory !== 'All') ||
    (dateRange && dateRange !== 'all') ||
    radius ||
    userLocation ||
    (selectedCity && selectedCity.name !== 'All India')
  );

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 space-y-3">
      {/* Top Filter Controls: Search, City, Date, Distance & Location */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events across India by title, venue, keywords..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Filter Dropdown */}
        <div className="relative min-w-[150px]">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
            <select
              value={selectedCity?.name || 'All India'}
              onChange={(e) => {
                const found = INDIAN_CITIES.find((c) => c.name === e.target.value);
                if (onSelectCity) onSelectCity(found || INDIAN_CITIES[0]);
              }}
              className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {INDIAN_CITIES.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name === 'All India' ? '🇮🇳 All India' : `${city.name}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative min-w-[130px]">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {DATE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance Filter Dropdown */}
        <div className="relative min-w-[130px]">
          <div className="relative">
            <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={radius || ''}
              onChange={(e) => onRadiusChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {DISTANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* "Near Me" / Location Trigger Button */}
        <div className="flex items-center gap-1.5">
          {!userLocation ? (
            <button
              onClick={onGetLocation}
              disabled={isLocating}
              title="Filter relative to your location in India"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all whitespace-nowrap"
            >
              <Navigation className={`w-3.5 h-3.5 text-indigo-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-2.5 py-1.5 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>Near You</span>
              <button
                onClick={onClearLocation}
                title="Remove location filter"
                className="ml-1 text-indigo-500 hover:text-indigo-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reset Filters button if any filters active */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              title="Clear all active filters"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
          {locationError}
        </p>
      )}

      {/* Quick City Chips (Horizontal scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Top Cities:
        </span>
        {INDIAN_CITIES.map((city) => {
          const isSelected = (selectedCity?.name || 'All India') === city.name;
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity && onSelectCity(city)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {city.name === 'All India' ? '🇮🇳 All India' : city.name}
            </button>
          );
        })}
      </div>

      {/* Category Pills (Horizontal scrolling) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
        <button
          onClick={() => onCategorySelect('All')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
          }`}
        >
          All Categories
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const count = categoryCounts[cat.name] ?? 0;
          return (
            <button
              key={cat.name}
              onClick={() => onCategorySelect(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
              />
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
