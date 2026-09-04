/**
 * Map utilities for parsing customer location and generating Google Maps links / embeds.
 * Supports both Order and Customer entity objects with fallback chains.
 */

export function extractLocationDetails(entity = {}) {
  if (!entity) entity = {};

  // Check for explicit coordinates
  const lat = entity.latitude ?? entity.lat ?? entity.delivery_lat ?? entity.location_lat ?? entity.customer?.latitude ?? null;
  const lng = entity.longitude ?? entity.lng ?? entity.delivery_lng ?? entity.location_lng ?? entity.customer?.longitude ?? null;
  const hasCoordinates = lat !== null && lng !== null && !isNaN(Number(lat)) && !isNaN(Number(lng));

  // Determine street / primary address
  const street = (
    entity.delivery_address ||
    entity.address ||
    entity.customer?.address ||
    entity.recent_orders?.[0]?.delivery_address ||
    ''
  ).trim();

  // Determine city & pincode
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

  // Contact & Name
  const customerName = entity.name || entity.customer?.name || entity.customer_name || 'Customer';
  const phone = entity.phone || entity.customer?.phone || entity.customer_phone || '';
  const specialInstructions = entity.special_instructions || '';

  // Clean formatted address for UI display
  const addressParts = [];
  if (street) addressParts.push(street);
  if (city && !street.toLowerCase().includes(city.toLowerCase())) {
    addressParts.push(city);
  }
  if (pincodeRaw) {
    addressParts.push(`Pincode: ${pincodeRaw}`);
  }

  const fullAddress = addressParts.length > 0
    ? addressParts.join(', ')
    : `${city}, Telangana, India`;

  // Search query optimized for Google Maps geocoding
  // Google Maps matches best without "Pincode:" text prefix, e.g. "Madhapur, Hyderabad 500081, India"
  let query = '';
  if (hasCoordinates) {
    query = `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  } else {
    const queryParts = [];
    if (street) queryParts.push(street);
    if (city && !street.toLowerCase().includes(city.toLowerCase())) {
      queryParts.push(city);
    }
    if (pincodeRaw) {
      queryParts.push(pincodeRaw);
    }
    queryParts.push('Telangana, India');
    query = queryParts.join(', ');
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=${hasCoordinates ? 16 : 15}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return {
    hasCoordinates,
    lat: hasCoordinates ? Number(lat) : null,
    lng: hasCoordinates ? Number(lng) : null,
    street: street || 'Address on file',
    city: city || 'Hyderabad',
    pincode: pincodeRaw || '',
    fullAddress,
    query,
    customerName,
    phone,
    specialInstructions,
    googleMapsUrl,
    googleMapsEmbedUrl,
    directionsUrl,
  };
}
