import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Utensils, 
  Check, 
  X, 
  ChefHat, 
  Bike, 
  PackageCheck,
  Printer,
  Calendar,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Customer confirmed cart' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Kitchen acknowledged order' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Food being freshly cooked' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Handed to courier' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Successfully handed over' },
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await adminApi.getOrder(id);
      setOrder(res.data);
    } catch (err) {
      showError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (nextStatus) => {
    setActionLoading(true);
    try {
      await adminApi.updateOrderStatus(order.id, { status: nextStatus });
      showSuccess(`Order status updated to ${nextStatus}!`);
      await fetchOrder();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await adminApi.acceptOrder(order.id);
      showSuccess('Order accepted successfully!');
      await fetchOrder();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    setActionLoading(true);
    try {
      await adminApi.rejectOrder(order.id, reason);
      showSuccess('Order rejected');
      setRejectModalOpen(false);
      await fetchOrder();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', margin: '0 auto 20px' }} />
        <div className="skeleton" style={{ height: '240px', maxWidth: '800px', margin: '0 auto' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 12px' }} />
        <h3>Order Not Found</h3>
        <button onClick={() => navigate('/admin/orders')} className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.order_status);
  const isCancelledOrRejected = ['CANCELLED', 'REJECTED'].includes(order.order_status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back and Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn btn-outline"
            style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                Order #{order.order_number}
              </h2>
              <StatusBadge status={order.order_status} size={15} />
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Calendar size={14} />
              <span>Placed on {new Date(order.created_at).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-outline"
          style={{ gap: '8px' }}
        >
          <Printer size={16} />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Rejection notice if rejected */}
      {order.order_status === 'REJECTED' && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#991b1b',
        }}>
          <div style={{ fontWeight: 700 }}>Order Rejected by Admin</div>
          <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>
            Reason: <strong>{order.rejection_reason || 'No specific reason provided'}</strong>
          </div>
        </div>
      )}

      {/* Status Progression Timeline */}
      {!isCancelledOrRejected && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>
            Order Fulfillment Timeline
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}>
            {/* Horizontal Line behind */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '5%',
              right: '5%',
              height: '3px',
              backgroundColor: '#e2e8f0',
              zIndex: 1,
            }} />

            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div 
                  key={step.key} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    textAlign: 'center',
                    flex: 1,
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--primary)' : isPast ? '#16a34a' : '#ffffff',
                    border: `3px solid ${isCurrent ? 'var(--primary)' : isPast ? '#16a34a' : '#cbd5e1'}`,
                    color: isPast || isCurrent ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(234, 88, 12, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {isPast && !isCurrent ? <Check size={18} /> : (idx + 1)}
                  </div>

                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#ea580c' : isPast ? '#0f172a' : '#94a3b8',
                    marginTop: '8px',
                  }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context-Aware Action Banner */}
      <div className="card" style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '5px solid var(--primary)',
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
            Current Status: {order.order_status}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Take action to transition the order through its delivery lifecycle.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {order.order_status === 'PENDING' && (
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="btn btn-success"
              >
                <Check size={16} />
                <span>Accept Order</span>
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                className="btn btn-danger"
              >
                <X size={16} />
                <span>Reject Order</span>
              </button>
            </>
          )}

          {order.order_status === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusChange('PREPARING')}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ backgroundColor: '#0284c7' }}
            >
              <ChefHat size={16} />
              <span>Start Preparing / Cooking</span>
            </button>
          )}

          {order.order_status === 'PREPARING' && (
            <button
              onClick={() => handleStatusChange('OUT_FOR_DELIVERY')}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ backgroundColor: '#7c3aed' }}
            >
              <Bike size={16} />
              <span>Mark Ready / Out for Delivery</span>
            </button>
          )}

          {order.order_status === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => handleStatusChange('DELIVERED')}
              disabled={actionLoading}
              className="btn btn-success"
            >
              <PackageCheck size={16} />
              <span>Mark as Delivered</span>
            </button>
          )}

          {order.order_status === 'DELIVERED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700 }}>
              <PackageCheck size={20} />
              <span>Order Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Customer Details & Order Items Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {/* Left Column: Customer & Delivery Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Profile Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
              Customer Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Name</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customer?.name || 'Customer'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Phone size={14} color="#64748b" />
                  <span>{order.phone || order.customer?.phone || '—'}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Mail size={14} color="#64748b" />
                  <span>{order.customer?.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
              Delivery Address
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <MapPin size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.delivery_address}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  {order.city || 'Hyderabad'}, Pincode: {order.pincode || '500001'}
                </div>
              </div>
            </div>

            {order.special_instructions && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                fontSize: '0.825rem',
                color: '#92400e',
              }}>
                <strong>Special Instructions:</strong> {order.special_instructions}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
              Payment Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Method:</span>
                <span style={{ fontWeight: 700 }}>{order.payment_method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{
                  fontWeight: 700,
                  color: order.payment_status === 'PAID' ? '#16a34a' : '#d97706',
                }}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Items & Financials */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
            Ordered Items ({order.items?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '14px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>
                    {item.food_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    ₹{item.price} × {item.quantity}
                  </div>
                </div>

                <div style={{ fontWeight: 800, color: '#0f172a' }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          {/* Charges Breakdown */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{order.subtotal?.toFixed(0)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
              <span>Delivery Fee</span>
              <span style={{ fontWeight: 600 }}>₹{order.delivery_fee?.toFixed(0)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#0f172a',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '12px',
              marginTop: '4px',
            }}>
              <span>Total Amount</span>
              <span style={{ color: '#ea580c' }}>₹{order.total_amount?.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        title={`Reject Order #${order.order_number}?`}
        message="Please select or provide a rejection reason. The customer will immediately receive this notification."
        confirmText="Confirm Rejection"
        confirmVariant="danger"
        isRejectModal={true}
        loading={actionLoading}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
      />
    </div>
  );
};

export default OrderDetails;
