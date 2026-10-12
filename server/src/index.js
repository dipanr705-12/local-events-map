require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { validateEvent, ALLOWED_CATEGORIES } = require('./validation');
const { calculateDistanceKm, getDateRange } = require('./utils');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all origins for local development / testing
}));
app.use(express.json());

// Auto-seed if database is empty
try {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM events;').get();
  if (!countRow || countRow.count === 0) {
    console.log('No events found in database. Running initial seed...');
    seedDatabase();
  }
} catch (err) {
  console.error('Error during initial DB check:', err);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Map & application config
app.get('/api/config', (req, res) => {
  res.json({
    tileUrl: process.env.MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: process.env.MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    defaultCenter: {
      lat: 20.5937,
      lng: 78.9629,
      zoom: 5,
      cityName: 'India',
    },
    categories: ALLOWED_CATEGORIES,
  });
});

// Categories with event counts
app.get('/api/categories', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM events 
      GROUP BY category
    `).all();

    const countsMap = {};
    for (const row of rows) {
      countsMap[row.category] = row.count;
    }

    const categoriesWithCount = ALLOWED_CATEGORIES.map((cat) => ({
      name: cat,
      count: countsMap[cat] || 0,
    }));

    res.json({ categories: categoriesWithCount });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get events with filtering, search, and distance calculation
app.get('/api/events', (req, res) => {
  try {
    const {
      search,
      category,
      dateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      lat,
      lng,
      radius,
      sortBy = 'date',
      favorites,
    } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    // Filter by category
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Filter by search keyword
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(venue) LIKE ? OR LOWER(address) LIKE ?)';
      params.push(term, term, term, term);
    }

    // Filter by date range
    let startD = customStartDate;
    let endD = customEndDate;

    if (dateRange && dateRange !== 'all') {
      const range = getDateRange(dateRange);
      if (range.startDate) startD = range.startDate;
      if (range.endDate) endD = range.endDate;
    }

    if (startD) {
      query += ' AND date >= ?';
      params.push(startD);
    }
    if (endD) {
      query += ' AND date <= ?';
      params.push(endD);
    }

    // Filter by specific favorite IDs
    if (favorites) {
      const ids = favorites.split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean);
      if (ids.length > 0) {
        query += ` AND id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);
      } else {
        // Empty favorites list requested
        return res.json({ events: [], total: 0 });
      }
    }

    query += ' ORDER BY date ASC, time ASC';

    const events = db.prepare(query).all(...params);

    // Distance calculation and radius filtering
    const userLat = lat !== undefined && lat !== '' ? parseFloat(lat) : null;
    const userLng = lng !== undefined && lng !== '' ? parseFloat(lng) : null;
    const maxRadius = radius !== undefined && radius !== '' ? parseFloat(radius) : null;

    let processedEvents = events.map((ev) => {
      let distanceKm = null;
      if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        distanceKm = calculateDistanceKm(userLat, userLng, ev.latitude, ev.longitude);
      }
      return {
        ...ev,
        distanceKm,
      };
    });

    if (maxRadius !== null && !isNaN(maxRadius) && userLat !== null && userLng !== null) {
      processedEvents = processedEvents.filter(
        (ev) => ev.distanceKm !== null && ev.distanceKm <= maxRadius
      );
    }

    // Sort options
    if (sortBy === 'distance' && userLat !== null && userLng !== null) {
      processedEvents.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    } else if (sortBy === 'title') {
      processedEvents.sort((a, b) => a.title.localeCompare(b.title));
    }

    res.json({
      events: processedEvents,
      total: processedEvents.length,
      filters: {
        category: category || 'All',
        search: search || '',
        dateRange: dateRange || 'all',
        radius: maxRadius,
        userLocation: userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null,
      },
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// Create new event
app.post('/api/events', (req, res) => {
  try {
    const { valid, errors, sanitized } = validateEvent(req.body);

    if (!valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    const stmt = db.prepare(`
      INSERT INTO events (
        title, description, category, date, time, endDate, endTime,
        venue, address, latitude, longitude, price, organizer, imageUrl, website
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      sanitized.title,
      sanitized.description,
      sanitized.category,
      sanitized.date,
      sanitized.time,
      sanitized.endDate,
      sanitized.endTime,
      sanitized.venue,
      sanitized.address,
      sanitized.latitude,
      sanitized.longitude,
      sanitized.price,
      sanitized.organizer,
      sanitized.imageUrl,
      sanitized.website
    );

    const createdEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Event created successfully',
      event: createdEvent,
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { valid, errors, sanitized } = validateEvent(req.body);
    if (!valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    const stmt = db.prepare(`
      UPDATE events SET
        title = ?, description = ?, category = ?, date = ?, time = ?,
        endDate = ?, endTime = ?, venue = ?, address = ?, latitude = ?,
        longitude = ?, price = ?, organizer = ?, imageUrl = ?, website = ?
      WHERE id = ?
    `);

    stmt.run(
      sanitized.title,
      sanitized.description,
      sanitized.category,
      sanitized.date,
      sanitized.time,
      sanitized.endDate,
      sanitized.endTime,
      sanitized.venue,
      sanitized.address,
      sanitized.latitude,
      sanitized.longitude,
      sanitized.price,
      sanitized.organizer,
      sanitized.imageUrl,
      sanitized.website,
      id
    );

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Reset / Re-seed sample data endpoint
app.post('/api/seed', (req, res) => {
  try {
    const count = seedDatabase();
    res.json({ message: `Successfully seeded ${count} sample events.` });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Geocoding helper proxy (using OpenStreetMap Nominatim with proper headers)
app.get('/api/geocode', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query "q" is required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Geocoding service unavailable' });
    }

    const data = await response.json();
    const results = data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
    }));

    res.json({ results });
  } catch (err) {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Failed to resolve location' });
  }
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Local Events Map API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
