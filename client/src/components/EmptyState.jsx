import React from 'react';
import { CalendarX, SearchX, HeartOff, RotateCcw, Plus } from 'lucide-react';

export default function EmptyState({
  type = 'no-results',
  onReset,
  onAddEvent,
}) {
  if (type === 'no-favorites') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
          <HeartOff className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base mb-1">No Saved Events Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          Click the heart icon on any event card or detail window to save events you're interested in attending.
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all"
          >
            Explore All Events
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-1">No Events Found</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        We couldn't find any events matching your selected search terms or filters. Try adjusting your distance, date range, or category.
      </p>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
        {onAddEvent && (
          <button
            onClick={onAddEvent}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Event</span>
          </button>
        )}
      </div>
    </div>
  );
}
