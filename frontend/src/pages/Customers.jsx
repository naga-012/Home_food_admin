import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ShieldAlert, ShieldCheck, Eye, Ban } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchCustomers = async () => {
    try {
      const res = await adminApi.getCustomers({ search: searchTerm || undefined });
      setCustomers(res.data || []);
    } catch (err) {
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleToggleStatus = async () => {
    if (!selectedCust) return;
    setActionLoading(true);
    try {
      const res = await adminApi.toggleCustomerStatus(selectedCust.id);
      showSuccess(res.data.message);
      setBlockModalOpen(false);
      setSelectedCust(null);
      await fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update customer status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Customer Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            View customer registered accounts, lifetime ordering metrics, and manage access
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Orders</th>
              <th>Total Spending</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading customer records...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No customer accounts found matching your query.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                  </td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.city || 'Hyderabad'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.total_orders}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#ea580c' }}>₹{c.total_spending?.toFixed(0)}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      backgroundColor: c.is_active ? '#dcfce7' : '#fee2e2',
                      color: c.is_active ? '#15803d' : '#b91c1c',
                    }}>
                      {c.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      <span>{c.is_active ? 'Active' : 'Blocked'}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCust(c);
                          setBlockModalOpen(true);
                        }}
                        className={`btn ${c.is_active ? 'btn-danger' : 'btn-success'} btn-sm`}
                      >
                        <Ban size={13} />
                        <span>{c.is_active ? 'Block' : 'Unblock'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={blockModalOpen}
        title={selectedCust?.is_active ? `Block ${selectedCust?.name}?` : `Unblock ${selectedCust?.name}?`}
        message={
          selectedCust?.is_active
            ? 'Blocking will immediately prevent this customer from placing new orders on INTI RUCHI.'
            : 'Unblocking will restore normal ordering access for this customer account.'
        }
        confirmText={selectedCust?.is_active ? 'Block Account' : 'Unblock Account'}
        confirmVariant={selectedCust?.is_active ? 'danger' : 'success'}
        loading={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          setBlockModalOpen(false);
          setSelectedCust(null);
        }}
      />
    </div>
  );
};

export default Customers;
