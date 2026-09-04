import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  PackageCheck, 
  XCircle, 
  IndianRupee, 
  Users, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  MapPin
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import MapModal from '../components/MapModal';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);
  const [selectedMapOrder, setSelectedMapOrder] = useState(null);

  const { autoRefresh, setPendingCount } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [dashRes, revRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRevenueReport(),
      ]);
      setData(dashRes.data);
      setPendingCount(dashRes.data?.statistics?.pending_orders || 0);
      setRevenueTrend(revRes.data?.daily_revenue_trend || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleAccept = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await adminApi.acceptOrder(orderId);
      showSuccess(`Order #${orderId} accepted successfully!`);
      await fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to accept order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (orderId, orderNum) => {
    setOrderToReject({ id: orderId, number: orderNum });
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason) => {
    if (!orderToReject) return;
    setActionLoadingId(orderToReject.id);
    try {
      await adminApi.rejectOrder(orderToReject.id, reason);
      showSuccess(`Order #${orderToReject.number} rejected`);
      setRejectModalOpen(false);
      setOrderToReject(null);
      await fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to reject order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = data?.statistics || {};
  const recentOrders = data?.recent_orders || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Alert for Pending Orders */}
      {stats.pending_orders > 0 && (
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
            }} className="pulse-glow">
              {stats.pending_orders}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem' }}>
                {stats.pending_orders} New Order{stats.pending_orders > 1 ? 's' : ''} Awaiting Admin Action!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#c2410c' }}>
                Customer orders are waiting for acceptance or kitchen preparation.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/orders?status=PENDING')}
            className="btn btn-primary"
            style={{ backgroundColor: '#ea580c' }}
          >
            <span>Review Pending Orders</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        <StatCard
          title="Total Orders"
          value={stats.total_orders?.toLocaleString() || '0'}
          icon={ShoppingBag}
          color="#0f172a"
          bgLight="#f1f5f9"
          onClick={() => navigate('/admin/orders')}
        />

        <StatCard
          title="Pending Orders"
          value={stats.pending_orders || '0'}
          icon={Clock}
          color="#d97706"
          bgLight="#fef3c7"
          subtitle="Action required"
          onClick={() => navigate('/admin/orders?status=PENDING')}
        />

        <StatCard
          title="Accepted / Prep"
          value={(stats.accepted_orders || 0) + (stats.preparing_orders || 0)}
          icon={ChefHat}
          color="#0284c7"
          bgLight="#e0f2fe"
          subtitle={`${stats.preparing_orders || 0} in cooking`}
          onClick={() => navigate('/admin/orders?status=PREPARING')}
        />

        <StatCard
          title="Out for Delivery"
          value={stats.out_for_delivery_orders || '0'}
          icon={Bike}
          color="#7c3aed"
          bgLight="#ede9fe"
          onClick={() => navigate('/admin/orders?status=OUT_FOR_DELIVERY')}
        />

        <StatCard
          title="Delivered"
          value={stats.delivered_orders?.toLocaleString() || '0'}
          icon={PackageCheck}
          color="#16a34a"
          bgLight="#dcfce7"
          onClick={() => navigate('/admin/orders?status=DELIVERED')}
        />

        <StatCard
          title="Total Revenue"
          value={`₹${stats.total_revenue?.toLocaleString() || '0'}`}
          icon={IndianRupee}
          color="#ea580c"
          bgLight="#ffedd5"
          subtitle={`Today: ₹${stats.today_revenue || 0}`}
          onClick={() => navigate('/admin/reports')}
        />

        <StatCard
          title="Total Customers"
          value={stats.total_customers?.toLocaleString() || '0'}
          icon={Users}
          color="#0d9488"
          bgLight="#ccfbf1"
          onClick={() => navigate('/admin/customers')}
        />
      </div>

      {/* Analytics & Trends Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {/* Revenue Trend Visual Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                7-Day Revenue Trend
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Live aggregated revenue across recent active orders
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              <TrendingUp size={16} />
              <span>Real DB</span>
            </div>
          </div>

          {/* Clean Interactive SVG Bar Visualization */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
            {revenueTrend.length > 0 ? (
              revenueTrend.map((day, idx) => {
                const maxVal = Math.max(...revenueTrend.map((d) => d.revenue), 100);
                const heightPct = Math.max(12, Math.round((day.revenue / maxVal) * 100));

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                      ₹{day.revenue.toFixed(0)}
                    </div>
                    <div 
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        backgroundColor: idx === revenueTrend.length - 1 ? '#ea580c' : '#fdba74',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.5s ease',
                      }}
                      title={`${day.date}: ₹${day.revenue}`}
                    />
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>
                      {day.date}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ flex: 1, textAlign: 'center', color: '#94a3b8', alignSelf: 'center' }}>
                No recent order revenue recorded
              </div>
            )}
          </div>
        </div>

        {/* Quick Order Status Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Order Status Breakdown
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Current distribution of all placed orders
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Pending Verification', count: stats.pending_orders || 0, color: '#f59e0b', total: stats.total_orders },
              { label: 'Accepted by Kitchen', count: stats.accepted_orders || 0, color: '#10b981', total: stats.total_orders },
              { label: 'Freshly Cooking', count: stats.preparing_orders || 0, color: '#0284c7', total: stats.total_orders },
              { label: 'Out for Delivery', count: stats.out_for_delivery_orders || 0, color: '#8b5cf6', total: stats.total_orders },
              { label: 'Safely Delivered', count: stats.delivered_orders || 0, color: '#059669', total: stats.total_orders },
            ].map((item, i) => {
              const pct = item.total ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '9999px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Customer Orders
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Real customer orders placed via the INTI RUCHI customer website
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/orders')}
            className="btn btn-outline btn-sm"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
            No recent orders placed yet.
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer & Delivery Address</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => {
                  const isProcessing = actionLoadingId === ord.id;
                  const formattedDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const deliveryAddress = ord.delivery_address || ord.address || '';
                  const city = ord.city || 'Hyderabad';

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        #{ord.order_number}
                      </td>
                      <td style={{ minWidth: '220px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{ord.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.customer_phone || '—'}</div>
                        <div style={{
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          color: '#334155',
                        }}>
                          <MapPin size={13} color="#ea580c" style={{ flexShrink: 0 }} />
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px',
                            fontWeight: 500,
                          }}>
                            {deliveryAddress || city}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedMapOrder(ord)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.7rem',
                              color: '#ea580c',
                              background: '#ffedd5',
                              border: 'none',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                            title="View Customer Location on Google Maps"
                          >
                            Map
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        ₹{ord.total_amount?.toFixed(0)}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          backgroundColor: ord.payment_status === 'PAID' ? '#dcfce7' : '#f1f5f9',
                          color: ord.payment_status === 'PAID' ? '#15803d' : '#64748b',
                        }}>
                          {ord.payment_status}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={ord.order_status} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {formattedDate}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => navigate(`/admin/orders/${ord.id}`)}
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMapOrder(ord)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '5px 8px', color: '#ea580c', borderColor: '#fed7aa' }}
                            title="View Customer on Google Maps"
                          >
                            <MapPin size={14} />
                          </button>
                          {ord.order_status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAccept(ord.id)}
                                disabled={isProcessing}
                                className="btn btn-success btn-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => openRejectModal(ord.id, ord.order_number)}
                                disabled={isProcessing}
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        title={`Reject Order #${orderToReject?.number}?`}
        message="Please select or provide a reason for rejecting this customer order. The reason will be displayed to the customer in their orders screen."
        confirmText="Confirm Rejection"
        confirmVariant="danger"
        isRejectModal={true}
        loading={actionLoadingId === orderToReject?.id}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setOrderToReject(null);
        }}
      />

      {/* Customer Google Location Modal */}
      <MapModal
        isOpen={!!selectedMapOrder}
        onClose={() => setSelectedMapOrder(null)}
        order={selectedMapOrder}
      />
    </div>
  );
};

export default Dashboard;
