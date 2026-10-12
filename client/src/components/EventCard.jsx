import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Heart, Navigation, Tag } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

function formatDate(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function EventCard({
  event,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onHover,
}) {
  const [imageError, setImageError] = useState(false);
  const categoryColor = CATEGORY_COLORS[event.category] || '#6366f1';

  return (
    <div
      onClick={() => onSelect(event)}
      onMouseEnter={() => onHover && onHover(event.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative flex flex-col sm:flex-row bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md translate-y-[-1px]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:translate-y-[-1px]'
      }`}
    >
      {/* Event Image / Thumbnail */}
      <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
        {event.imageUrl && !imageError ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 text-white text-center"
            style={{
              background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}88)`,
            }}
          >
            <Tag className="w-8 h-8 mb-1 opacity-90" />
            <span className="text-xs font-semibold uppercase tracking-wider">{event.category}</span>
          </div>
        )}

        {/* Category Pill Tag Overlay on Image */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs"
            style={{ backgroundColor: `${categoryColor}ee` }}
          >
            {event.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(event.id);
          }}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 shadow-sm backdrop-blur-xs transition-transform active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time Header */}
          <div className="flex items-center justify-between gap-2 text-xs text-indigo-600 font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(event.date)}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">{formatTime(event.time)}</span>
            </div>

            {/* Price Badge */}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
              {event.price || 'Free'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>

          {/* Venue & Location */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{event.venue}</span>
            <span className="text-slate-300">—</span>
            <span className="text-slate-500 truncate">{event.address}</span>
          </div>

          {/* Description snippet */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Footer meta: distance and organizer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[180px]">
            <span className="text-slate-400">By</span>
            <span className="font-medium text-slate-700 truncate">{event.organizer || 'Community Member'}</span>
          </div>

          {event.distanceKm !== null && event.distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <Navigation className="w-3 h-3 text-emerald-500" />
              <span>{event.distanceKm} km away</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
