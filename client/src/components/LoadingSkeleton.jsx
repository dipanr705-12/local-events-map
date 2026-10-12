import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row bg-white rounded-xl border border-slate-200 p-4 gap-4 animate-pulse"
        >
          <div className="w-full sm:w-44 h-32 bg-slate-200 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2.5 py-1">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-28" />
              <div className="h-4 bg-slate-200 rounded w-12" />
            </div>
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3.5 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-3 bg-slate-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
