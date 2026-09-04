import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Navigation, 
  Copy, 
  Check, 
  Compass, 
  Phone, 
  FileText,
  Loader2
} from 'lucide-react';
import { extractLocationDetails } from '../utils/mapUtils';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/api';

const MapModal = ({ isOpen, onClose, order, customer }) => {
  const { showSuccess } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [fullEntity, setFullEntity] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const target = fullEntity || order || customer;

  useEffect(() => {
    // If opened with an order that is missing delivery_address or city, try hydrating from API
    if (isOpen && order && order.id && !order.delivery_address && !order.address) {
      let isMounted = true;
      setLoadingDetails(true);
      adminApi.getOrder(order.id)
        .then((res) => {
          if (isMounted && res.data) {
            setFullEntity(res.data);
          }
        })
        .catch((err) => {
          console.warn('Could not hydrate full order address in MapModal:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingDetails(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setFullEntity(null);
      setLoadingDetails(false);
    }
  }, [isOpen, order]);

  if (!isOpen || !target) return null;

  const loc = extractLocationDetails(target);
  const identifier = target.order_number 
    ? `Order #${target.order_number}` 
    : target.id ? `Customer #${target.id}` : 'Customer Location';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(loc.googleMapsUrl);
    setCopiedLink(true);
    showSuccess('Google Maps link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(loc.fullAddress);
    setCopiedAddress(true);
    showSuccess('Customer delivery address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              flexShrink: 0,
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Customer Delivery Location
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                {identifier} • <strong style={{ color: '#334155' }}>{loc.customerName}</strong>
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
          {/* Address Details Card */}
          <div style={{
            padding: '16px 18px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Delivery Address
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', lineHeight: 1.4 }}>
                    {loadingDetails ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <Loader2 size={14} className="spin" /> Loading address details...
                      </span>
                    ) : (
                      loc.street
                    )}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '3px' }}>
                    {loc.city}{loc.pincode ? ` — Pincode: ${loc.pincode}` : ''}
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
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1px solid #bbf7d0',
                }}>
                  <Compass size={13} />
                  GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  <MapPin size={13} color="#ea580c" />
                  Address Pinned
                </span>
              )}
            </div>

            {/* Extra context: Phone and Special Instructions */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.825rem',
            }}>
              {loc.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <Phone size={14} color="#0284c7" />
                  <strong>Phone:</strong>
                  <a href={`tel:${loc.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                    {loc.phone}
                  </a>
                </div>
              )}

              {loc.specialInstructions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c2d12' }}>
                  <FileText size={14} color="#ea580c" />
                  <strong>Note:</strong> {loc.specialInstructions}
                </div>
              )}
            </div>
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
              title={`Customer Location Map - ${identifier}`}
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

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="btn btn-outline"
                style={{ gap: '6px', fontSize: '0.8rem' }}
                title="Copy street delivery address"
              >
                {copiedAddress ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-outline"
                style={{ gap: '6px', fontSize: '0.8rem' }}
                title="Copy Google Maps link to share with delivery agent"
              >
                {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Map Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
