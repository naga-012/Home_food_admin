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
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { extractLocationDetails } from '../utils/mapUtils';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => navigate('/admin/customers')}
          className="btn btn-outline"
          style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{customer.name}</h2>
          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Customer Profile & Order History
          </div>
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

      {/* Customer Info Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Contact & Address</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Email Address</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{customer.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Phone Number</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{customer.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Delivery Address</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{customer.address || '—'}</div>
            {customer.address && (
              <a
                href={extractLocationDetails(customer).googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#ea580c',
                  marginTop: '4px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={12} />
                <span>View on Google Maps</span>
              </a>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>City & Pincode</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{customer.city || 'Hyderabad'}, {customer.pincode || '—'}</div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          Order History ({customer.recent_orders?.length || 0})
        </h3>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
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
                    <td style={{ fontWeight: 800 }}>₹{ord.total_amount?.toFixed(0)}</td>
                    <td>{ord.payment_status}</td>
                    <td><StatusBadge status={ord.order_status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/admin/orders/${ord.id}`)}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
