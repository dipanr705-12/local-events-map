const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEvent, ALLOWED_CATEGORIES } = require('../src/validation');
const { calculateDistanceKm, getDateRange } = require('../src/utils');

test('Validation: accepts a complete valid event in India', () => {
  const validPayload = {
    title: 'Bengaluru AI Builders Showcase',
    description: 'A great evening with live tech demos, founders, and networking.',
    category: 'Tech & AI',
    date: '2026-10-15',
    time: '19:00',
    venue: 'Indiranagar Tech Hub',
    address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka',
    latitude: 12.9719,
    longitude: 77.6412,
    price: 'Free',
  };

  const result = validateEvent(validPayload);
  assert.equal(result.valid, true);
  assert.equal(Object.keys(result.errors).length, 0);
  assert.equal(result.sanitized.title, 'Bengaluru AI Builders Showcase');
  assert.equal(result.sanitized.latitude, 12.9719);
  assert.equal(result.sanitized.longitude, 77.6412);
});

test('Validation: rejects payload with missing required fields', () => {
  const emptyPayload = {};
  const result = validateEvent(emptyPayload);
  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
  assert.ok(result.errors.description);
  assert.ok(result.errors.category);
  assert.ok(result.errors.date);
  assert.ok(result.errors.venue);
  assert.ok(result.errors.latitude);
  assert.ok(result.errors.longitude);
});

test('Validation: rejects short title and short description', () => {
  const result = validateEvent({
    title: 'AB',
    description: 'Too short',
    category: 'Tech & AI',
    date: '2026-10-15',
    time: '10:00',
    venue: 'V',
    address: '1',
    latitude: 12.97,
    longitude: 77.59,
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.title, 'Title must be at least 3 characters');
  assert.equal(result.errors.description, 'Description must be at least 10 characters');
  assert.equal(result.errors.venue, 'Venue name must be at least 2 characters');
});

test('Validation: rejects invalid category', () => {
  const result = validateEvent({
    title: 'Valid Title Here',
    description: 'Valid description that is sufficiently long for validation.',
    category: 'NonExistentCategory',
    date: '2026-10-15',
    time: '10:00',
    venue: 'Venue Name',
    address: '123 MG Road',
    latitude: 12.97,
    longitude: 77.59,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.category.includes('Category must be one of'));
});

test('Validation: rejects coordinates outside of India bounds', () => {
  const invalidLat = validateEvent({
    title: 'Valid Title Here',
    description: 'Valid description that is long enough.',
    category: 'Tech & AI',
    date: '2026-10-15',
    time: '10:00',
    venue: 'Venue Name',
    address: '123 MG Road',
    latitude: 45.0, // Outside India (> 38.0)
    longitude: 77.59,
  });
  assert.equal(invalidLat.valid, false);
  assert.ok(invalidLat.errors.latitude.includes('within India'));

  const invalidLng = validateEvent({
    title: 'Valid Title Here',
    description: 'Valid description that is long enough.',
    category: 'Tech & AI',
    date: '2026-10-15',
    time: '10:00',
    venue: 'Venue Name',
    address: '123 MG Road',
    latitude: 12.97,
    longitude: -122.4, // Outside India (< 68.0)
  });
  assert.equal(invalidLng.valid, false);
  assert.ok(invalidLng.errors.longitude.includes('within India'));
});

test('Distance: calculates accurate Haversine distance in Indian locations', () => {
  // Same coordinates (Bengaluru MG Road)
  const zeroDist = calculateDistanceKm(12.9756, 77.6097, 12.9756, 77.6097);
  assert.equal(zeroDist, 0);

  // Bengaluru Indiranagar (12.9719, 77.6412) to Cubbon Park (12.9763, 77.5929)
  const distIndiranagarToCubbon = calculateDistanceKm(12.9719, 77.6412, 12.9763, 77.5929);
  // Distance is ~5.26 km
  assert.ok(distIndiranagarToCubbon >= 5.0 && distIndiranagarToCubbon <= 5.6, `Expected ~5.3km, got ${distIndiranagarToCubbon}`);

  // Mumbai Carter Road (19.0657, 72.8256) to Gateway of India (18.9220, 72.8347)
  const distCarterToGateway = calculateDistanceKm(19.0657, 72.8256, 18.9220, 72.8347);
  // Distance is ~16 km
  assert.ok(distCarterToGateway >= 15.0 && distCarterToGateway <= 17.5, `Expected ~16km, got ${distCarterToGateway}`);
});

test('Date Range: returns appropriate range boundaries', () => {
  const refDate = new Date('2026-10-12T10:00:00Z'); // Monday, Oct 12, 2026

  const today = getDateRange('today', refDate);
  assert.equal(today.startDate, '2026-10-12');
  assert.equal(today.endDate, '2026-10-12');

  const tomorrow = getDateRange('tomorrow', refDate);
  assert.equal(tomorrow.startDate, '2026-10-13');
  assert.equal(tomorrow.endDate, '2026-10-13');

  const weekend = getDateRange('weekend', refDate);
  assert.equal(weekend.startDate, '2026-10-17'); // Saturday
  assert.equal(weekend.endDate, '2026-10-18'); // Sunday

  const week = getDateRange('week', refDate);
  assert.equal(week.startDate, '2026-10-12');
  assert.equal(week.endDate, '2026-10-19');
});
