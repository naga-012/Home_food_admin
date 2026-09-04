import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  IndianRupee,
  Calendar,
  Eye,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Compass,
  MessageSquare
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MapModal from '../components/MapModal';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { extractLocationDetails, generateWhatsAppLocationRequestUrl } from '../utils/mapUtils';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMapOrder, setSelectedMapOrder] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await adminApi.getCustomer(id);
        setCustomer(res.data);
      } catch (err) {
        showError('Failed to fetch customer profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3>Customer Not Found</h3>
        <button onClick={() => navigate('/admin/customers')} className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Customers
        </button>
      </div>
    );
  }

  // Resolve best address from profile or past orders
  const recentOrderWithAddress = customer.recent_orders?.find((o) => o.delivery_address);
  const resolvedAddress = customer.address || recentOrderWithAddress?.delivery_address || '';
  const resolvedCity = customer.city || recentOrderWithAddress?.city || 'Hyderabad';
  const resolvedPincode = customer.pincode || recentOrderWithAddress?.pincode || '';

  const loc = extractLocationDetails({
    ...customer,
    address: resolvedAddress,
    city: resolvedCity,
    pincode: resolvedPincode,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(loc.googleMapsUrl);
    setCopiedLink(true);
    showSuccess('Google Maps link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(loc.fullAddress);
    setCopiedAddress(true);
    showSuccess('Customer address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Collect any distinct past order addresses
  const pastAddresses = (customer.recent_orders || [])
    .filter((o) => o.delivery_address && o.delivery_address !== resolvedAddress)
    .map((o) => ({
      address: o.delivery_address,
      city: o.city,
      pincode: o.pincode,
      orderNumber: o.order_number,
      orderId: o.id,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/admin/customers')}
            className="btn btn-outline"
            style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{customer.name}</h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.725rem',
                fontWeight: 700,
                backgroundColor: customer.is_active ? '#dcfce7' : '#fee2e2',
                color: customer.is_active ? '#15803d' : '#b91c1c',
              }}>
                {customer.is_active ? 'Active Customer' : 'Blocked'}
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Customer #{customer.id} • Registered {new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
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
        </div>
      </div>

      {/* Profile & KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Spent</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
            ₹{customer.total_spending?.toFixed(0)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {customer.total_orders}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Completed Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            {customer.completed_orders}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Cancelled Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            {customer.cancelled_orders}
          </div>
        </div>
      </div>

      {/* Customer Location & Contact Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid #f1f5f9',
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Customer Location & Delivery Details
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Accurate address, geolocation, and direct map navigation
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {customer?.phone && (
              <a
                href={generateWhatsAppLocationRequestUrl(customer.phone, customer.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ gap: '6px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', textDecoration: 'none' }}
                title="Send WhatsApp message asking customer for live location pin"
              >
                <MessageSquare size={14} />
                <span>WhatsApp Live Pin</span>
              </a>
            )}

            <button
              onClick={handleCopyAddress}
              className="btn btn-outline btn-sm"
              style={{ gap: '6px' }}
            >
              {copiedAddress ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copiedAddress ? 'Address Copied' : 'Copy Address'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn btn-outline btn-sm"
              style={{ gap: '6px' }}
            >
              {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Map Link'}</span>
            </button>

            <a
              href={loc.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ gap: '6px', color: '#0284c7', borderColor: '#bae6fd', textDecoration: 'none' }}
            >
              <Navigation size={14} />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left: Contact Info & Address Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Primary Delivery Address Banner */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fff7ed',
              borderRadius: '12px',
              border: '1px solid #fed7aa',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Primary Delivery Address
                </span>
                {loc.hasCoordinates ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    <Compass size={11} /> GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#fed7aa',
                    color: '#9a3412',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    <MapPin size={11} /> Address Pin
                  </span>
                )}
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
                {resolvedAddress || 'No primary street address registered'}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span><strong>City:</strong> {resolvedCity}</span>
                {resolvedPincode && <span><strong>Pincode:</strong> {resolvedPincode}</span>}
                {loc.localityName && (
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>
                    <strong>Locality:</strong> {loc.localityName}
                  </span>
                )}
                <span><strong>State:</strong> Telangana, India</span>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#0284c7" />
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                      {customer.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#64748b" />
                  <span>{customer.email}</span>
                </div>
              </div>
            </div>

            {/* Other addresses from order history if available */}
            {pastAddresses.length > 0 && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  Other Delivery Locations Used in Previous Orders:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pastAddresses.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      fontSize: '0.8rem',
                      padding: '6px 8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.address} ({item.city || 'Hyderabad'})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMapOrder({
                          id: item.orderId,
                          order_number: item.orderNumber,
                          delivery_address: item.address,
                          city: item.city,
                          pincode: item.pincode,
                          customer: { name: customer.name, phone: customer.phone },
                        })}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.725rem', whiteSpace: 'nowrap' }}
                      >
                        Map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Embedded Interactive Google Map */}
          <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '280px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#f1f5f9',
          }}>
            <iframe
              title={`Customer Location Map - ${customer.name}`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '280px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={loc.googleMapsEmbedUrl}
            />
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Order History ({customer.recent_orders?.length || 0})
          </h3>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Delivery Address</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No orders placed yet by this customer.
                  </td>
                </tr>
              ) : (
                customer.recent_orders?.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>#{ord.order_number}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ord.delivery_address || resolvedAddress || '—'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        {ord.city || resolvedCity}{ord.pincode ? `, ${ord.pincode}` : ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{ord.total_amount?.toFixed(0)}</td>
                    <td>{ord.payment_status}</td>
                    <td><StatusBadge status={ord.order_status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedMapOrder({
                            ...ord,
                            customer: { name: customer.name, phone: customer.phone },
                          })}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '5px 8px', color: '#ea580c', borderColor: '#fed7aa' }}
                          title="View this order delivery location on map"
                        >
                          <MapPin size={13} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/orders/${ord.id}`)}
                          className="btn btn-outline btn-sm"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Modal for order inspection */}
      <MapModal
        isOpen={!!selectedMapOrder}
        onClose={() => setSelectedMapOrder(null)}
        order={selectedMapOrder}
      />
    </div>
  );
};

export default CustomerDetails;
