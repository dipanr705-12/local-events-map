const API_BASE = '/api';

export async function fetchEvents(filters = {}) {
  const query = new URLSearchParams();

  if (filters.search) query.append('search', filters.search);
  if (filters.category && filters.category !== 'All') query.append('category', filters.category);
  if (filters.dateRange && filters.dateRange !== 'all') query.append('dateRange', filters.dateRange);
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);
  if (filters.lat !== undefined && filters.lat !== null) query.append('lat', filters.lat);
  if (filters.lng !== undefined && filters.lng !== null) query.append('lng', filters.lng);
  if (filters.radius) query.append('radius', filters.radius);
  if (filters.sortBy) query.append('sortBy', filters.sortBy);
  if (filters.favorites) query.append('favorites', filters.favorites);

  const res = await fetch(`${API_BASE}/events?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch events');
  }
  return res.json();
}

export async function fetchEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch event');
  }
  return res.json();
}

export async function createEvent(eventData) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { message: data.error || 'Validation error', details: data.details || {} };
  }
  return data;
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete event');
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch configuration');
  return res.json();
}

export async function resetSeedData() {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset seed data');
  return res.json();
}

export async function geocodeSearch(query) {
  const res = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) return { results: [] };
  return res.json();
}
