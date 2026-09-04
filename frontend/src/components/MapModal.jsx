import React, { useState } from 'react';
import { X, MapPin, ExternalLink, Navigation, Copy, Check, Compass } from 'lucide-react';
import { extractLocationDetails } from '../utils/mapUtils';
import { useToast } from '../context/ToastContext';

const MapModal = ({ isOpen, onClose, order }) => {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const loc = extractLocationDetails(order);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(loc.googleMapsUrl);
    setCopied(true);
    showSuccess('Google Maps location link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Customer Google Location
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Order #{order.order_number || order.id} • {order.customer?.name || order.customer_name || 'Customer'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Address Details Banner */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                    {order.delivery_address || order.address || 'Address on file'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    {order.city || 'Hyderabad'}{order.pincode ? `, Pincode: ${order.pincode}` : ''}
                  </div>
                </div>
              </div>

              {loc.hasCoordinates ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1px solid #bbf7d0',
                }}>
                  <Compass size={12} />
                  GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  Address Pin
                </span>
              )}
            </div>

            {order.phone && (
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                <strong>Customer Contact:</strong> {order.phone}
              </div>
            )}
          </div>

          {/* Embedded Google Map */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#f1f5f9',
          }}>
            <iframe
              title={`Customer Location Map - Order ${order.order_number || order.id}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={loc.googleMapsEmbedUrl}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={loc.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', gap: '6px' }}
              >
                <ExternalLink size={15} />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={loc.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ textDecoration: 'none', gap: '6px', borderColor: '#0284c7', color: '#0284c7' }}
              >
                <Navigation size={15} />
                <span>Get Directions</span>
              </a>
            </div>

            <button
              onClick={handleCopyLink}
              className="btn btn-outline"
              style={{ gap: '6px' }}
            >
              {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy Location Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
