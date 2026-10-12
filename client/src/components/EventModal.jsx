import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  ExternalLink,
  Navigation,
  Trash2,
  CalendarPlus,
  User,
  Tag,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

function formatDate(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const minute = m || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onDeleteEvent,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const categoryColor = CATEGORY_COLORS[event.category] || '#6366f1';

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    try {
      const startDateTime = `${event.date.replace(/-/g, '')}T${(event.time || '10:00').replace(':', '')}00`;
      const endDate = event.endDate || event.date;
      const endDateTime = `${endDate.replace(/-/g, '')}T${(event.endTime || '12:00').replace(':', '')}00`;
      const details = encodeURIComponent(event.description || '');
      const location = encodeURIComponent(`${event.venue}, ${event.address}`);
      const text = encodeURIComponent(event.title);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${event.venue}, ${event.address}`
    )}&destination_place_id=&travelmode=driving`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} at ${event.venue}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-800 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}99)`,
              }}
            >
              <Tag className="w-12 h-12 mb-2 opacity-80" />
              <span className="text-sm font-bold uppercase tracking-wider">{event.category}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

          {/* Badges on Hero */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm mb-2"
                style={{ backgroundColor: categoryColor }}
              >
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm leading-tight">
                {event.title}
              </h2>
            </div>

            <div className="shrink-0">
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-white text-slate-900 shadow-sm">
                {event.price || 'Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Date & Time</p>
                <p className="text-sm font-semibold text-slate-900">{formatDate(event.date)}</p>
                <p className="text-xs text-slate-600">
                  {formatTime(event.time)}
                  {event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
                </p>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Location</p>
                <p className="text-sm font-semibold text-slate-900">{event.venue}</p>
                <p className="text-xs text-slate-600 truncate max-w-[220px]">{event.address}</p>
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Organized By</p>
                <p className="text-sm font-semibold text-slate-900">{event.organizer || 'Community Member'}</p>
              </div>
            </div>

            {/* Distance (if available) */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Proximity</p>
                <p className="text-sm font-semibold text-slate-900">
                  {event.distanceKm !== null && event.distanceKm !== undefined
                    ? `${event.distanceKm} km from you`
                    : 'Coordinates: ' + event.latitude.toFixed(3) + ', ' + event.longitude.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About This Event</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              {/* Save/Favorite */}
              <button
                onClick={() => onToggleFavorite(event.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Delete */}
              {onDeleteEvent && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                      onDeleteEvent(event.id);
                      onClose();
                    }
                  }}
                  title="Delete event"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Outbound Actions: Calendar, Website, Directions */}
            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
              >
                <CalendarPlus className="w-4 h-4 text-indigo-600" />
                <span>Calendar</span>
              </a>

              {event.website && (
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}

              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
