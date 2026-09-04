/**
 * Map utilities for parsing customer location and generating Google Maps links / embeds.
 * Supports exact GPS coordinates, regex parsing of coordinates/links, local high-precision
 * Hyderabad directory, and live geocoding fallback.
 */

// Comprehensive Hyderabad locality & colony directory with verified GPS coordinates
const HYDERABAD_LOCALITIES = [
  { keys: ['kphp', 'kphb', 'kphb colony', 'kukatpally housing board'], lat: 17.493802, lng: 78.401765, name: 'KPHB Colony, Kukatpally' },
  { keys: ['satavahana nagar', 'samatha nagar'], lat: 17.498877, lng: 78.396442, name: 'Satavahana Nagar, Kukatpally' },
  { keys: ['masab tank', 'masab tank road', 'owaisipura'], lat: 17.401433, lng: 78.451655, name: 'Masab Tank, Hyderabad' },
  { keys: ['ac guards', 'a.c. guards', 'ac guard'], lat: 17.398500, lng: 78.458000, name: 'AC Guards, Khairatabad' },
  { keys: ['financial district', 'palm grove', 'wave rock'], lat: 17.415600, lng: 78.342700, name: 'Financial District, Nanakramguda' },
  { keys: ['hitec city', 'hiteccity', 'green view', 'cyber towers'], lat: 17.447400, lng: 78.376200, name: 'Hitec City, Madhapur' },
  { keys: ['gachibowli', 'rainbow meadows', 'pbel city'], lat: 17.440100, lng: 78.348900, name: 'Gachibowli' },
  { keys: ['madhapur', 'kavuri hills', 'ayyappa society'], lat: 17.448300, lng: 78.391500, name: 'Madhapur' },
  { keys: ['kondapur', 'raghavendra colony', 'raja rajeshwari'], lat: 17.469900, lng: 78.357800, name: 'Kondapur' },
  { keys: ['my home bhooja', 'bhooja'], lat: 17.440800, lng: 78.381200, name: 'My Home Bhooja, Hitec City' },
  { keys: ['orchid springs', 'manikonda', 'puppa laguda', 'puppalguda'], lat: 17.404200, lng: 78.378900, name: 'Manikonda' },
  { keys: ['banjara hills', 'road no 12 banjara', 'road no 1 banjara', 'road no 10 banjara', 'road no 2 banjara'], lat: 17.415600, lng: 78.435400, name: 'Banjara Hills' },
  { keys: ['jubilee hills', 'road no 36 jubilee', 'road no 45 jubilee', 'film nagar'], lat: 17.431900, lng: 78.407300, name: 'Jubilee Hills' },
  { keys: ['kukatpally', 'y junction', 'vivekananda nagar', 'kphb phase'], lat: 17.484900, lng: 78.413800, name: 'Kukatpally' },
  { keys: ['ameerpet', 'sr nagar', 's.r. nagar', 'dharampuram'], lat: 17.437500, lng: 78.448200, name: 'Ameerpet' },
  { keys: ['khairatabad', 'raj bhavan'], lat: 17.411600, lng: 78.461900, name: 'Khairatabad' },
  { keys: ['somajiguda', 'punjagutta', 'panjagutta'], lat: 17.425600, lng: 78.458300, name: 'Somajiguda' },
  { keys: ['begumpet', 'prakash nagar', 'kundalbagh'], lat: 17.444700, lng: 78.466400, name: 'Begumpet' },
  { keys: ['secunderabad', 'marredpally', 'east marredpally', 'west marredpally', 'clock tower'], lat: 17.439900, lng: 78.498300, name: 'Secunderabad' },
  { keys: ['mehdipatnam', 'gudimalkapur', 'asif nagar'], lat: 17.391600, lng: 78.440100, name: 'Mehdipatnam' },
  { keys: ['tolichowki', 'shaikpet', 'paramount colony'], lat: 17.401900, lng: 78.408900, name: 'Tolichowki' },
  { keys: ['nanakramguda', 'khajaguda', 'raheja it park'], lat: 17.420100, lng: 78.347800, name: 'Nanakramguda' },
  { keys: ['miyapur', 'allwyn colony', 'hafeezpet'], lat: 17.496800, lng: 78.358700, name: 'Miyapur' },
  { keys: ['nizampet', 'bachupally'], lat: 17.518600, lng: 78.384200, name: 'Nizampet' },
  { keys: ['chanda nagar', 'chandanagar', 'bhel'], lat: 17.492700, lng: 78.326800, name: 'Chanda Nagar' },
  { keys: ['dilsukhnagar', 'kothapet', 'chaitanyapuri'], lat: 17.368800, lng: 78.524700, name: 'Dilsukhnagar' },
  { keys: ['lb nagar', 'l.b. nagar', 'nagole', 'kamineni'], lat: 17.350200, lng: 78.552900, name: 'LB Nagar' },
  { keys: ['uppal', 'habsiguda', 'tarnaka', 'nacharam'], lat: 17.401800, lng: 78.560200, name: 'Uppal' },
  { keys: ['bowenpally', 'alwal', 'kompally', 'suchitra'], lat: 17.472100, lng: 78.479100, name: 'Bowenpally' },
  { keys: ['abids', 'koti', 'sultan bazar', 'nampally'], lat: 17.392400, lng: 78.478200, name: 'Abids / Nampally' },
  { keys: ['charminar', 'old city', 'falaknuma', 'madina'], lat: 17.361600, lng: 78.474700, name: 'Charminar, Old City' },
];

// Pincode fallback coordinates across Greater Hyderabad
const HYDERABAD_PINCODES = {
  '500085': { lat: 17.498877, lng: 78.396442, name: 'Satavahana Nagar / Kukatpally' },
  '500072': { lat: 17.493802, lng: 78.401765, name: 'KPHB Colony' },
  '500081': { lat: 17.447400, lng: 78.376200, name: 'Hitec City / Madhapur' },
  '500057': { lat: 17.401433, lng: 78.451655, name: 'Masab Tank' },
  '500032': { lat: 17.440100, lng: 78.348900, name: 'Gachibowli' },
  '500034': { lat: 17.415600, lng: 78.435400, name: 'Banjara Hills' },
  '500033': { lat: 17.431900, lng: 78.407300, name: 'Jubilee Hills' },
  '500084': { lat: 17.469900, lng: 78.357800, name: 'Kondapur' },
  '500004': { lat: 17.398500, lng: 78.458000, name: 'AC Guards / Khairatabad' },
  '500028': { lat: 17.398000, lng: 78.445000, name: 'Masab Tank / Mehdipatnam' },
  '500089': { lat: 17.404200, lng: 78.378900, name: 'Manikonda' },
  '500038': { lat: 17.437500, lng: 78.448200, name: 'Ameerpet / SR Nagar' },
  '500016': { lat: 17.444700, lng: 78.466400, name: 'Begumpet' },
  '500003': { lat: 17.439900, lng: 78.498300, name: 'Secunderabad' },
  '500018': { lat: 17.456300, lng: 78.439800, name: 'Sanath Nagar' },
  '500049': { lat: 17.496800, lng: 78.358700, name: 'Miyapur' },
  '500090': { lat: 17.518600, lng: 78.384200, name: 'Nizampet' },
  '500050': { lat: 17.492700, lng: 78.326800, name: 'Chanda Nagar' },
  '500060': { lat: 17.368800, lng: 78.524700, name: 'Dilsukhnagar' },
  '500074': { lat: 17.350200, lng: 78.552900, name: 'LB Nagar' },
  '500039': { lat: 17.401800, lng: 78.560200, name: 'Uppal' },
  '500011': { lat: 17.472100, lng: 78.479100, name: 'Bowenpally' },
  '500001': { lat: 17.392400, lng: 78.478200, name: 'Abids / Koti' },
  '500002': { lat: 17.361600, lng: 78.474700, name: 'Charminar' },
};

// In-memory geocode cache to prevent duplicate lookups
const geocodeCache = new Map();

/**
 * Extract GPS coordinates from plain text strings, notes, or Google Maps links
 */
export function parseCoordinatesFromText(text) {
  if (!text || typeof text !== 'string') return null;

  // Pattern 1: Direct coordinates like "17.498877, 78.396442" or "[GPS: 17.4029, 78.4508]"
  const coordRegex = /(?:gps|loc|lat(?:itude)?|coords?|pin)?[:\s\[(]*(-?\d{1,2}\.\d{3,9})\s*[,/ ]\s*(-?\d{1,3}\.\d{3,9})[\])\s]*/i;
  const match = text.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
      return { lat, lng, source: 'embedded_gps' };
    }
  }

  // Pattern 2: Google Maps URL containing coordinates: @17.4029,78.4508 or ?q=17.4029,78.4508
  if (text.includes('google.com/maps') || text.includes('maps.app.goo.gl') || text.includes('goo.gl/maps')) {
    const urlCoordMatch = text.match(/[@?&]q?=?(-?\d{1,2}\.\d{3,9}),(-?\d{1,3}\.\d{3,9})/);
    if (urlCoordMatch) {
      const lat = parseFloat(urlCoordMatch[1]);
      const lng = parseFloat(urlCoordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, source: 'google_maps_url' };
      }
    }
  }

  return null;
}

/**
 * Match address against the local high-precision Hyderabad locality & pincode directory
 */
export function matchLocalHyderabadDirectory(address = '', pincode = '') {
  const normAddress = (address || '').toLowerCase().trim();
  const normPin = (pincode || '').toString().trim();

  // 1. Search locality keys
  if (normAddress) {
    for (const loc of HYDERABAD_LOCALITIES) {
      for (const key of loc.keys) {
        // Word boundary check or substring match
        if (normAddress.includes(key)) {
          return {
            lat: loc.lat,
            lng: loc.lng,
            name: loc.name,
            accuracy: 'locality_directory',
          };
        }
      }
    }
  }

  // 2. Search pincode directory
  if (normPin && HYDERABAD_PINCODES[normPin]) {
    const pinData = HYDERABAD_PINCODES[normPin];
    return {
      lat: pinData.lat,
      lng: pinData.lng,
      name: pinData.name,
      accuracy: 'pincode_directory',
    };
  }

  return null;
}

/**
 * Clean street and query parts to eliminate duplicate text and format for optimal Google Maps resolution
 */
function cleanQueryString(street, city, pincode) {
  let cleanedStreet = (street || '').trim();

  // Normalize common informal abbreviations
  cleanedStreet = cleanedStreet
    .replace(/\bkphp\b/gi, 'KPHB Colony')
    .replace(/\bkphb\b/gi, 'KPHB Colony')
    .replace(/\bMasab Tank Road, Masab Tank\b/gi, 'Masab Tank Road')
    .replace(/\bAc guards\b/gi, 'AC Guards, Khairatabad')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = [];
  if (cleanedStreet) parts.push(cleanedStreet);
  if (city && !cleanedStreet.toLowerCase().includes(city.toLowerCase())) {
    parts.push(city);
  }
  if (pincode && !cleanedStreet.includes(pincode)) {
    parts.push(pincode);
  }
  parts.push('Telangana, India');

  return parts.join(', ');
}

/**
 * Main function: extracts high-precision location details with multi-stage fallback
 */
export function extractLocationDetails(entity = {}) {
  if (!entity) entity = {};

  // Stage 1: Explicit coordinates from object properties
  let lat = entity.latitude ?? entity.lat ?? entity.delivery_lat ?? entity.location_lat ?? entity.coords?.lat ?? entity.customer?.latitude ?? null;
  let lng = entity.longitude ?? entity.lng ?? entity.delivery_lng ?? entity.location_lng ?? entity.coords?.lng ?? entity.customer?.longitude ?? null;
  let coordinateSource = 'explicit';

  // Primary street address
  const rawStreet = (
    entity.delivery_address ||
    entity.address ||
    entity.customer?.address ||
    entity.recent_orders?.[0]?.delivery_address ||
    ''
  ).trim();

  // Special instructions or notes
  const specialInstructions = (entity.special_instructions || '').trim();

  // Stage 2: Parse coordinates from address text or instructions
  if ((lat === null || lng === null || isNaN(Number(lat)) || isNaN(Number(lng)))) {
    const parsedFromAddress = parseCoordinatesFromText(rawStreet) || parseCoordinatesFromText(specialInstructions);
    if (parsedFromAddress) {
      lat = parsedFromAddress.lat;
      lng = parsedFromAddress.lng;
      coordinateSource = parsedFromAddress.source;
    }
  }

  // City and pincode
  const city = (
    entity.city ||
    entity.customer?.city ||
    entity.recent_orders?.[0]?.city ||
    'Hyderabad'
  ).trim();

  const pincodeRaw = (
    entity.pincode ||
    entity.customer?.pincode ||
    entity.recent_orders?.[0]?.pincode ||
    ''
  ).toString().trim();

  // Stage 3: Match against verified Hyderabad localities & colonies directory
  let localityMatch = null;
  if ((lat === null || lng === null || isNaN(Number(lat)) || isNaN(Number(lng)))) {
    localityMatch = matchLocalHyderabadDirectory(rawStreet, pincodeRaw);
    if (localityMatch) {
      lat = localityMatch.lat;
      lng = localityMatch.lng;
      coordinateSource = localityMatch.accuracy;
    }
  }

  const hasCoordinates = lat !== null && lng !== null && !isNaN(Number(lat)) && !isNaN(Number(lng));
  const finalLat = hasCoordinates ? Number(lat) : null;
  const finalLng = hasCoordinates ? Number(lng) : null;

  // Contact details
  const customerName = entity.name || entity.customer?.name || entity.customer_name || 'Customer';
  const phone = entity.phone || entity.customer?.phone || entity.customer_phone || '';
  const orderNumber = entity.order_number || (entity.id ? `Order #${entity.id}` : '');

  // Format clean display address
  const addressParts = [];
  if (rawStreet) addressParts.push(rawStreet);
  if (city && !rawStreet.toLowerCase().includes(city.toLowerCase())) {
    addressParts.push(city);
  }
  if (pincodeRaw) {
    addressParts.push(`Pincode: ${pincodeRaw}`);
  }
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : `${city}, Telangana, India`;

  // Search query: if coordinates exist, use exact lat,lng for pinpoint accuracy
  let query = '';
  if (hasCoordinates) {
    query = `${finalLat.toFixed(6)},${finalLng.toFixed(6)}`;
  } else {
    query = cleanQueryString(rawStreet, city, pincodeRaw);
  }

  // Google Maps URLs: z=17 provides doorstep / building-level satellite resolution
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${finalLat.toFixed(6)},${finalLng.toFixed(6)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  const googleMapsEmbedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${finalLat.toFixed(6)},${finalLng.toFixed(6)}&hl=en&z=17&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=16&output=embed`;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${finalLat.toFixed(6)},${finalLng.toFixed(6)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return {
    hasCoordinates,
    isExactGps: coordinateSource === 'explicit' || coordinateSource === 'embedded_gps',
    coordinateSource,
    localityName: localityMatch?.name || null,
    lat: finalLat,
    lng: finalLng,
    street: rawStreet || 'Address on file',
    city: city || 'Hyderabad',
    pincode: pincodeRaw || '',
    fullAddress,
    query,
    customerName,
    phone,
    orderNumber,
    specialInstructions,
    googleMapsUrl,
    googleMapsEmbedUrl,
    directionsUrl,
  };
}

/**
 * Generate 1-click WhatsApp Live Location request link
 * Allows admin / delivery rider to message the customer directly to share their live WhatsApp pin
 */
export function generateWhatsAppLocationRequestUrl(phone, customerName = 'Customer', orderNumber = '') {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const orderPrefix = orderNumber ? ` for order *${orderNumber}*` : '';
  const message = `Hello ${customerName}! 👋\n\nThis is regarding your food delivery${orderPrefix} from *INTI RUCHI* 🍲.\n\nCould you please share your *Live Location / Current Location* on WhatsApp so our delivery partner can navigate straight to your doorstep without delay?\n\nThank you!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Asynchronously geocode an address using OpenStreetMap Nominatim with local memory + sessionStorage caching
 */
export async function resolveExactCoordinates(address, city = 'Hyderabad', pincode = '') {
  const queryStr = `${address}, ${city} ${pincode}, India`.trim();
  const cacheKey = `geo_${queryStr.toLowerCase().replace(/\s+/g, '_')}`;

  // Check in-memory cache
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Check sessionStorage
  try {
    const stored = sessionStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      geocodeCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch (e) {
    // sessionStorage not available
  }

  try {
    const encoded = encodeURIComponent(queryStr);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`, {
      headers: {
        'Accept-Language': 'en',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        accuracy: 'nominatim_live',
      };
      geocodeCache.set(cacheKey, result);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (e) {}
      return result;
    }
  } catch (err) {
    console.warn('Live geocoding fallback failed:', err);
  }

  return null;
}
