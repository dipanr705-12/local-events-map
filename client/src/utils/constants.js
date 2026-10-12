export const CATEGORIES = [
  { name: 'Tech & AI', color: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'Cpu' },
  { name: 'Music & Concerts', color: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'Music' },
  { name: 'Food & Drink', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'Utensils' },
  { name: 'Arts & Culture', color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'Palette' },
  { name: 'Sports & Fitness', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'Activity' },
  { name: 'Community & Meetup', color: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: 'Users' },
  { name: 'Outdoors & Nature', color: '#84cc16', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', icon: 'Trees' },
];

export const CATEGORY_COLORS = {
  'Tech & AI': '#6366f1',
  'Music & Concerts': '#ec4899',
  'Food & Drink': '#f97316',
  'Arts & Culture': '#8b5cf6',
  'Sports & Fitness': '#10b981',
  'Community & Meetup': '#0ea5e9',
  'Outdoors & Nature': '#84cc16',
};

export const DEFAULT_INDIA_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
  zoom: 5,
};

export const INDIAN_CITIES = [
  { name: 'All India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 12 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 12 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 12 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 12 },
  { name: 'Goa', lat: 15.2993, lng: 74.1240, zoom: 11 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, zoom: 12 },
];

export const DEFAULT_PRESET_IMAGES = [
  { label: 'Technology / Code', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80' },
  { label: 'Concert / Music', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80' },
  { label: 'Food / Culinary', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Art / Gallery', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fitness / Yoga', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nature / Outdoors', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80' },
  { label: 'Networking / Meetup', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
];

export const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'week', label: 'Next 7 Days' },
];

export const DISTANCE_OPTIONS = [
  { value: '', label: 'Any Distance' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
  { value: '100', label: 'Within 100 km' },
];
