/**
 * Map utilities for parsing customer location and generating Google Maps links / embeds.
 */

export function extractLocationDetails(order = {}) {
  // Check for explicit coordinates
  const lat = order.latitude ?? order.lat ?? order.delivery_lat ?? order.location_lat ?? null;
  const lng = order.longitude ?? order.lng ?? order.delivery_lng ?? order.location_lng ?? null;
  const hasCoordinates = lat !== null && lng !== null && !isNaN(Number(lat)) && !isNaN(Number(lng));

  // Build clean text address
  const addressParts = [
    order.delivery_address || order.address,
    order.city,
    order.pincode ? `Pincode: ${order.pincode}` : null,
  ].filter(Boolean);

  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Hyderabad, Telangana, India';

  const query = hasCoordinates ? `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}` : fullAddress;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=${hasCoordinates ? 16 : 14}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return {
    hasCoordinates,
    lat: hasCoordinates ? Number(lat) : null,
    lng: hasCoordinates ? Number(lng) : null,
    fullAddress,
    query,
    googleMapsUrl,
    googleMapsEmbedUrl,
    directionsUrl,
  };
}
