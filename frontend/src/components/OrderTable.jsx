import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, X, ArrowRight, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import MapModal from './MapModal';

const OrderTable = ({
  orders = [],
  loading = false,
  onAccept,
  onReject,
  actionLoadingId = null,
}) => {
  const navigate = useNavigate();
  const [selectedMapOrder, setSelectedMapOrder] = useState(null);

  if (loading && orders.length === 0) {
    return (
      <div className="admin-table-wrapper" style={{ padding: '24px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="skeleton" style={{ height: '36px', width: '120px' }} />
            <div className="skeleton" style={{ height: '36px', width: '160px' }} />
            <div className="skeleton" style={{ height: '36px', flex: 1 }} />
            <div className="skeleton" style={{ height: '36px', width: '90px' }} />
            <div className="skeleton" style={{ height: '36px', width: '100px' }} />
            <div className="skeleton" style={{ height: '36px', width: '140px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="admin-table-wrapper" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍽️</div>
        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '6px' }}>No Orders Found</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          No customer orders match the selected filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Food Items</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date & Time</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isProcessing = actionLoadingId === order.id;
            const itemsSummary = order.items && order.items.length > 0
              ? order.items.map((it) => `${it.food_name} × ${it.quantity}`).join(', ')
              : 'Food Items';

            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr key={order.id} style={{
                backgroundColor: order.order_status === 'PENDING' ? '#fffbf5' : 'transparent',
              }}>
                {/* Order ID */}
                <td>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    #{order.order_number}
                  </div>
                </td>

                {/* Customer */}
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {order.customer?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {order.phone || order.customer?.phone || '—'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMapOrder(order)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.725rem',
                      color: '#ea580c',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      marginTop: '3px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    title="Click to view Customer Google Map location"
                  >
                    <MapPin size={12} />
                    <span>View on Map</span>
                  </button>
                </td>

                {/* Items */}
                <td style={{ maxWidth: '240px' }}>
                  <div 
                    title={itemsSummary}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#334155',
                    }}
                  >
                    {itemsSummary}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </td>

                {/* Amount */}
                <td>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹{order.total_amount?.toFixed(0)}
                  </div>
                </td>

                {/* Payment */}
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: order.payment_status === 'PAID' ? '#dcfce7' : '#f1f5f9',
                    color: order.payment_status === 'PAID' ? '#166534' : '#64748b',
                    border: `1px solid ${order.payment_status === 'PAID' ? '#bbf7d0' : '#e2e8f0'}`,
                  }}>
                    {order.payment_method} · {order.payment_status}
                  </span>
                </td>

                {/* Order Status */}
                <td>
                  <StatusBadge status={order.order_status} />
                  {order.rejection_reason && (
                    <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '3px' }}>
                      {order.rejection_reason}
                    </div>
                  )}
                </td>

                {/* Date */}
                <td>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {formattedDate}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {/* View Button */}
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="btn btn-outline btn-sm"
                      title="View Complete Order"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>

                    {/* Google Location Map Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedMapOrder(order)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '5px 8px', color: '#ea580c', borderColor: '#fed7aa' }}
                      title="View Customer on Google Maps"
                    >
                      <MapPin size={14} />
                    </button>

                    {/* Pending Action Buttons */}
                    {order.order_status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onAccept && onAccept(order.id)}
                          disabled={isProcessing}
                          className="btn btn-success btn-sm"
                          title="Accept Order"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => onReject && onReject(order.id, order.order_number)}
                          disabled={isProcessing}
                          className="btn btn-danger btn-sm"
                          title="Reject Order"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* Quick Link to update other active states */}
                    {['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.order_status) && (
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#0284c7' }}
                      >
                        <span>Update</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Quick Customer Google Location Modal */}
      <MapModal
        isOpen={!!selectedMapOrder}
        onClose={() => setSelectedMapOrder(null)}
        order={selectedMapOrder}
      />
    </div>
  );
};

export default OrderTable;
