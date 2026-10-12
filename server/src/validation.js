const ALLOWED_CATEGORIES = [
  'Tech & AI',
  'Music & Concerts',
  'Food & Drink',
  'Arts & Culture',
  'Sports & Fitness',
  'Community & Meetup',
  'Outdoors & Nature',
];

/**
 * Validate event payload
 * @param {object} payload
 * @returns {{ valid: boolean, errors: Record<string, string>, sanitized?: object }}
 */
function validateEvent(payload) {
  const errors = {};

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: { general: 'Event payload is required' } };
  }

  const title = (payload.title || '').trim();
  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (title.length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  const description = (payload.description || '').trim();
  if (!description) {
    errors.description = 'Description is required';
  } else if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (description.length > 2500) {
    errors.description = 'Description cannot exceed 2500 characters';
  }

  const category = (payload.category || '').trim();
  if (!category) {
    errors.category = 'Category is required';
  } else if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`;
  }

  const date = (payload.date || '').trim();
  if (!date) {
    errors.date = 'Date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    errors.date = 'Date must be a valid date in YYYY-MM-DD format';
  }

  const time = (payload.time || '').trim();
  if (!time) {
    errors.time = 'Start time is required';
  }

  const venue = (payload.venue || '').trim();
  if (!venue) {
    errors.venue = 'Venue name is required';
  } else if (venue.length < 2) {
    errors.venue = 'Venue name must be at least 2 characters';
  }

  const address = (payload.address || '').trim();
  if (!address) {
    errors.address = 'Address is required';
  }

  const lat = parseFloat(payload.latitude);
  if (payload.latitude === undefined || payload.latitude === null || isNaN(lat)) {
    errors.latitude = 'Valid latitude coordinate is required';
  } else if (lat < 6.0 || lat > 38.0) {
    errors.latitude = 'Latitude must be within India (between 6.0 and 38.0 degrees)';
  }

  const lng = parseFloat(payload.longitude);
  if (payload.longitude === undefined || payload.longitude === null || isNaN(lng)) {
    errors.longitude = 'Valid longitude coordinate is required';
  } else if (lng < 68.0 || lng > 98.0) {
    errors.longitude = 'Longitude must be within India (between 68.0 and 98.0 degrees)';
  }

  const price = (payload.price || 'Free').trim();
  const organizer = (payload.organizer || '').trim();
  const imageUrl = (payload.imageUrl || '').trim();
  const website = (payload.website || '').trim();
  const endDate = (payload.endDate || '').trim() || null;
  const endTime = (payload.endTime || '').trim() || null;

  if (endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || isNaN(Date.parse(endDate)))) {
    errors.endDate = 'End date must be a valid date in YYYY-MM-DD format';
  }

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    errors.imageUrl = 'Image URL must start with http:// or https://';
  }

  if (website && !/^https?:\/\//i.test(website)) {
    errors.website = 'Website must start with http:// or https://';
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    sanitized: valid
      ? {
          title,
          description,
          category,
          date,
          time,
          endDate,
          endTime,
          venue,
          address,
          latitude: lat,
          longitude: lng,
          price,
          organizer: organizer || 'Community Member',
          imageUrl: imageUrl || null,
          website: website || null,
        }
      : undefined,
  };
}

module.exports = {
  ALLOWED_CATEGORIES,
  validateEvent,
};
