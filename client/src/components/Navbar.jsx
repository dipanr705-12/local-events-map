import React from 'react';
import { MapPin, Plus, Heart, RotateCcw, Map, List } from 'lucide-react';

export default function Navbar({
  onAddEventClick,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onResetSeed,
  isResetting,
  activeTab,
  onTabChange,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">LocalEvents <span className="text-indigo-600">India</span></span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                🇮🇳 India Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">Explore & discover happening events across India</p>
          </div>
        </div>

        {/* Mobile View Toggle (Map / List) */}
        <div className="md:hidden flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onTabChange('map')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'map'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => onTabChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'list'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites Filter Button */}
          <button
            onClick={onToggleFavoritesOnly}
            title={showFavoritesOnly ? 'Show all events' : 'Show saved events'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
              showFavoritesOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold ring-2 ring-rose-200'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                showFavoritesOnly ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                showFavoritesOnly ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Reset Seed Demo Data */}
          <button
            onClick={onResetSeed}
            disabled={isResetting}
            title="Reload sample seed events"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={onAddEventClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </header>
  );
}
