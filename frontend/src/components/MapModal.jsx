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
  Loader2,
  MessageSquare,
  Edit3,
  Search,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { 
  extractLocationDetails, 
  generateWhatsAppLocationRequestUrl,
  resolveExactCoordinates 
} from '../utils/mapUtils';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/api';

const MapModal = ({ isOpen, onClose, order, customer }) => {
  const { showSuccess, showInfo } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [fullEntity, setFullEntity] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Custom refinement state
  const [isRefining, setIsRefining] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [customOverride, setCustomOverride] = useState(null);
  const [resolvingGeocode, setResolvingGeocode] = useState(false);

  const baseTarget = fullEntity || order || customer;
  // Apply any admin refinement
  const target = customOverride ? { ...baseTarget, ...customOverride } : baseTarget;

  useEffect(() => {
    // Reset custom refinement when opening for a new entity
    setCustomOverride(null);
    setIsRefining(false);
    setRefineInput('');

    // If opened with an order that is missing delivery_address or city, hydrate from API
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

  // Attempt live geocoding resolution if coordinates are missing
  useEffect(() => {
    if (!isOpen || !target) return;
    const initialLoc = extractLocationDetails(target);
    if (!initialLoc.hasCoordinates && initialLoc.street) {
      let isMounted = true;
      resolveExactCoordinates(initialLoc.street, initialLoc.city, initialLoc.pincode)
        .then((geo) => {
          if (isMounted && geo) {
            setCustomOverride(prev => prev ? prev : { latitude: geo.lat, longitude: geo.lng });
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const loc = extractLocationDetails(target);
  const identifier = target.order_number 
    ? `Order #${target.order_number}` 
    : target.id ? `Customer #${target.id}` : 'Customer Location';

  const whatsAppUrl = generateWhatsAppLocationRequestUrl(loc.phone, loc.customerName, target.order_number || '');

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

  // Handle Admin Manual Pin Refinement
  const handleApplyRefinement = async (e) => {
    e?.preventDefault();
    if (!refineInput.trim()) return;

    setResolvingGeocode(true);
    // Check if input has coordinates (e.g., 17.4421, 78.3842)
    const coordMatch = refineInput.match(/(-?\d{1,2}\.\d{3,9})\s*[,/ ]\s*(-?\d{1,3}\.\d{3,9})/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setCustomOverride({ latitude: lat, longitude: lng });
      setResolvingGeocode(false);
      setIsRefining(false);
      showSuccess(`Exact GPS location set to ${lat.toFixed(4)}, ${lng.toFixed(4)}!`);
      return;
    }

    // Otherwise geocode the refined landmark or address
    const geo = await resolveExactCoordinates(refineInput.trim(), loc.city, loc.pincode);
    setResolvingGeocode(false);
    if (geo) {
      setCustomOverride({
        delivery_address: `${loc.street} (${refineInput.trim()})`,
        latitude: geo.lat,
        longitude: geo.lng,
      });
      setIsRefining(false);
      showSuccess(`Location resolved to exact coordinates: ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}`);
    } else {
      setCustomOverride({
        delivery_address: `${refineInput.trim()}, ${loc.city}`,
      });
      setIsRefining(false);
      showInfo('Map query updated with refined landmark.');
    }
  };

  const handleResetRefinement = () => {
    setCustomOverride(null);
    setRefineInput('');
    setIsRefining(false);
    showInfo('Reset to customer provided address.');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
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
        maxWidth: '720px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Customer Delivery Location</span>
                {loc.hasCoordinates && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                  }}>
                    Exact Pin Active
                  </span>
                )}
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
        <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Address Details Card */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1, minWidth: '240px' }}>
                <MapPin size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    {loc.localityName && (
                      <span style={{ marginLeft: '8px', color: '#0284c7', fontWeight: 600 }}>
                        • Locality: {loc.localityName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Accuracy Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                {loc.hasCoordinates ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: '1px solid #bbf7d0',
                  }}>
                    <Compass size={14} />
                    GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    border: '1px solid #fde68a',
                  }}>
                    <MapPin size={13} color="#ea580c" />
                    Street Matched
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsRefining(!isRefining)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <Edit3 size={12} />
                  {isRefining ? 'Close Refine Pin' : 'Refine / Adjust Pin'}
                </button>
              </div>
            </div>

            {/* Refine Pin Search Bar */}
            {isRefining && (
              <form onSubmit={handleApplyRefinement} style={{
                marginTop: '8px',
                padding: '10px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  Enter exact landmark, building name, or paste Google Maps coordinates:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Near Apollo Pharmacy, Masab Tank OR 17.4014, 78.4516"
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={resolvingGeocode || !refineInput.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    {resolvingGeocode ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
                    <span>Update Pin</span>
                  </button>

                  {customOverride && (
                    <button
                      type="button"
                      onClick={handleResetRefinement}
                      className="btn btn-outline btn-sm"
                      title="Reset to original customer address"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Extra context: Phone and Special Instructions */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.825rem',
              alignItems: 'center',
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

              {/* 1-Click WhatsApp Location Request */}
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                  title="Send message on WhatsApp asking customer for their Live Location pin"
                >
                  <MessageSquare size={13} />
                  <span>Request WhatsApp Live Location</span>
                </a>
              )}

              {loc.specialInstructions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c2d12', flex: 1 }}>
                  <FileText size={14} color="#ea580c" />
                  <strong>Note:</strong> {loc.specialInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Embedded Google Map with High-Precision Zoom */}
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
