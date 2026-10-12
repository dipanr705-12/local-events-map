const db = require('./db');

function getOffsetDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const sampleEvents = [
  {
    title: 'Bengaluru AI Agents & LLM Builders Hackathon',
    description: 'Join 200+ AI researchers, ML engineers, and founders for a 24-hour sprint building production autonomous agents, MCP workflows, and local LLM tooling. Cloud compute credits, food, and mentor office hours provided.',
    category: 'Tech & AI',
    daysOffset: 0, // Today
    time: '10:00',
    endTime: '20:00',
    venue: 'Indiranagar Tech Hub',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    latitude: 12.9719,
    longitude: 77.6412,
    price: 'Free',
    organizer: 'BLR AI Collective',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    website: 'https://blraicollective.example.com',
  },
  {
    title: 'Bandra Seaside Sunset Acoustic & Jazz Sessions',
    description: 'Enjoy handcrafted drinks and live saxophone & brass jazz performances overlooking the Arabian Sea. Cozy seating and ambient candlelight.',
    category: 'Music & Concerts',
    daysOffset: 1, // Tomorrow
    time: '18:30',
    endTime: '22:00',
    venue: 'Carter Road Amphitheatre',
    address: 'Carter Rd, Bandra West, Mumbai, Maharashtra 400050',
    latitude: 19.0657,
    longitude: 72.8256,
    price: '₹499',
    organizer: 'Bombay Acoustic Guild',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    website: 'https://bombayjazz.example.com',
  },
  {
    title: 'Dilli Haat Craft Artisans & Regional Food Mela',
    description: 'Over 50 traditional artisans, textile weavers, terracotta sculptors, and regional street food stalls from across India. Sample Kashmiri Wazwan, Rajasthani Dal Baati, and authentic filter coffee.',
    category: 'Food & Drink',
    daysOffset: 2,
    time: '16:00',
    endTime: '22:00',
    venue: 'Dilli Haat INA',
    address: 'Kidwai Nagar West, INA, New Delhi, Delhi 110023',
    latitude: 28.5733,
    longitude: 77.2075,
    price: '₹50 entry',
    organizer: 'Delhi Crafts Council',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    website: 'https://dillihaat.example.com',
  },
  {
    title: 'Cubbon Park Morning Vinyasa Yoga & Mindfulness',
    description: 'All-levels outdoor vinyasa flow followed by sound bath meditation under the shade of century-old bamboo groves in Cubbon Park. Bring your yoga mat and water bottle.',
    category: 'Sports & Fitness',
    daysOffset: 5, // Weekend
    time: '07:30',
    endTime: '09:00',
    venue: 'Cubbon Park Bandstand',
    address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001',
    latitude: 12.9763,
    longitude: 77.5929,
    price: 'Free',
    organizer: 'Namma Yoga Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    website: 'https://nammayoga.example.com',
  },
  {
    title: 'Kala Ghoda Contemporary Heritage & Art Walk',
    description: 'Interactive guided tour exploring South Mumbai’s historic art precinct, Jehangir Art Gallery exhibitions, neo-gothic architecture, and modern Indian installations.',
    category: 'Arts & Culture',
    daysOffset: 6, // Weekend
    time: '16:00',
    endTime: '19:30',
    venue: 'Jehangir Art Gallery',
    address: '161B Mahatma Gandhi Rd, Kala Ghoda, Fort, Mumbai, Maharashtra 400001',
    latitude: 18.9275,
    longitude: 72.8317,
    price: '₹350',
    organizer: 'Kala Ghoda Arts Guild',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    website: 'https://kalaghoda-walks.example.com',
  },
  {
    title: 'Vetal Tekdi Morning Birding & Nature Trail',
    description: 'Guided 5-km nature hike through ARAI hills and Vetal Tekdi. Spot peafowl, raptors, native migratory birds, and enjoy a sunrise panoramic view of Pune city.',
    category: 'Outdoors & Nature',
    daysOffset: 7,
    time: '06:30',
    endTime: '09:30',
    venue: 'Vetal Tekdi Hilltop',
    address: 'Paud Road, Kothrud, Pune, Maharashtra 411038',
    latitude: 18.5204,
    longitude: 73.8188,
    price: 'Free',
    organizer: 'Pune Nature Explorers',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    website: 'https://punenature.example.com',
  },
  {
    title: 'Cyber Hub Founders, Angel Investors & Coffee Meetup',
    description: 'Casual morning coffee and networking for early-stage startup founders, product leaders, and bootstrapped creators across Delhi NCR. Share insights and growth playbooks.',
    category: 'Community & Meetup',
    daysOffset: 3,
    time: '08:30',
    endTime: '11:00',
    venue: 'Cyber Hub Amphitheatre',
    address: 'DLF Cyber City, Sector 24, Gurugram, Haryana 122002',
    latitude: 28.4950,
    longitude: 77.0890,
    price: 'Free',
    organizer: 'NCR Startup Circle',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    website: 'https://ncrstartups.example.com',
  },
  {
    title: 'Hyderabad Indie Game Devs & XR Playtest Showcase',
    description: 'Hands-on playtesting for 12+ upcoming indie video games, VR experiences, and mobile adventures developed in India. Connect directly with game directors and visual artists.',
    category: 'Tech & AI',
    daysOffset: 8,
    time: '14:00',
    endTime: '18:30',
    venue: 'T-Hub Innovation Campus',
    address: 'Knowledge City, Raidurg, Hyderabad, Telangana 500081',
    latitude: 17.4334,
    longitude: 78.3783,
    price: '₹250',
    organizer: 'Hyd Game Devs Alliance',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    website: 'https://hydgamedevs.example.com',
  },
  {
    title: 'Amer Fort Golden Hour Heritage Photography Workshop',
    description: 'Master architectural and golden hour photography at historic Amer Fort. Learn manual camera settings, framing royal courtyards, and Lightroom color grading.',
    category: 'Arts & Culture',
    daysOffset: 10,
    time: '15:30',
    endTime: '19:00',
    venue: 'Amer Fort Courtyard',
    address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302028',
    latitude: 26.9855,
    longitude: 75.8513,
    price: '₹650',
    organizer: 'Jaipur Shutterbugs',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    website: 'https://jaipurphoto.example.com',
  },
  {
    title: 'Park Street Heritage Musical Evenings & Jazz Sessions',
    description: 'Relive Kolkata’s golden era of live rhythm & blues, saxophone melodies, and legendary cuisine on Park Street. Featuring celebrated local musicians and indie songwriters.',
    category: 'Music & Concerts',
    daysOffset: 4,
    time: '19:00',
    endTime: '22:30',
    venue: 'Trincas Heritage Lounge',
    address: '17 Park St, Taltala, Kolkata, West Bengal 700016',
    latitude: 22.5529,
    longitude: 88.3526,
    price: '₹799',
    organizer: 'Calcutta Jazz Collective',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    website: 'https://calcuttajazz.example.com',
  },
  {
    title: 'Besant Nagar Beach Sunrise Calisthenics & Fitness',
    description: 'High-energy seaside bodyweight training, mobility drills, and beach sprints on Elliot Beach. Suitable for all fitness levels with expert trainers guiding form.',
    category: 'Sports & Fitness',
    daysOffset: 12,
    time: '06:00',
    endTime: '08:00',
    venue: "Elliot's Beach Promenade",
    address: 'Besant Nagar, Chennai, Tamil Nadu 600090',
    latitude: 13.0001,
    longitude: 80.2711,
    price: 'Free',
    organizer: 'Madras Athletic Club',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
    website: 'https://madrasfitness.example.com',
  },
  {
    title: 'Anjuna Beachfront Flea Market, Street Food & Live Reggae',
    description: 'Vibrant coastal night market featuring Goan homebakers, handmade leather crafts, organic spices, live acoustic reggae, and fresh seafood barbecue under the palms.',
    category: 'Food & Drink',
    daysOffset: 14,
    time: '16:00',
    endTime: '23:00',
    venue: 'Anjuna Beach Grounds',
    address: 'Monterio Vaddo, Anjuna, Goa 403509',
    latitude: 15.5807,
    longitude: 73.7431,
    price: '₹200',
    organizer: 'Goa Coastal Creators',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    website: 'https://goacoastalcreators.example.com',
  }
];

function seedDatabase() {
  console.log('Clearing existing events...');
  db.exec('DELETE FROM events;');

  const insertStmt = db.prepare(`
    INSERT INTO events (
      title, description, category, date, time, endDate, endTime,
      venue, address, latitude, longitude, price, organizer, imageUrl, website
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let count = 0;
  for (const ev of sampleEvents) {
    const computedDate = getOffsetDate(ev.daysOffset);
    insertStmt.run(
      ev.title,
      ev.description,
      ev.category,
      computedDate,
      ev.time,
      computedDate,
      ev.endTime || null,
      ev.venue,
      ev.address,
      ev.latitude,
      ev.longitude,
      ev.price,
      ev.organizer,
      ev.imageUrl,
      ev.website
    );
    count++;
  }

  console.log(`Successfully seeded ${count} India events into database!`);
  return count;
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleEvents };
