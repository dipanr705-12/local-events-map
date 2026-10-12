/**
 * Calculate the great circle distance between two points on Earth using Haversine formula
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

/**
 * Helper to compute date range shortcuts
 * @param {string} filter 'all' | 'today' | 'tomorrow' | 'weekend' | 'week'
 * @param {Date} [referenceDate] Optional reference date for testing
 * @returns {{ startDate?: string, endDate?: string }}
 */
function getDateRange(filter, referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const toISODate = (d) => d.toISOString().split('T')[0];

  switch (filter) {
    case 'today': {
      const todayStr = toISODate(now);
      return { startDate: todayStr, endDate: todayStr };
    }
    case 'tomorrow': {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const str = toISODate(tomorrow);
      return { startDate: str, endDate: str };
    }
    case 'weekend': {
      // Find upcoming Saturday and Sunday
      const day = now.getDay(); // 0 is Sun, 6 is Sat
      const daysUntilSat = (6 - day + 7) % 7;
      const sat = new Date(now);
      sat.setDate(sat.getDate() + daysUntilSat);
      const sun = new Date(sat);
      sun.setDate(sun.getDate() + 1);
      return { startDate: toISODate(sat), endDate: toISODate(sun) };
    }
    case 'week': {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return { startDate: toISODate(now), endDate: toISODate(nextWeek) };
    }
    default:
      return {};
  }
}

module.exports = {
  calculateDistanceKm,
  getDateRange,
};
