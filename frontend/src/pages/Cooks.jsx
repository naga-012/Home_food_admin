import React, { useState, useEffect } from 'react';
import { ChefHat, Star, Check, X, Ban, Search, ShieldCheck } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const Cooks = () => {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchCooks = async () => {
    try {
      const res = await adminApi.getCooks({ status_filter: statusFilter !== 'ALL' ? statusFilter : undefined });
      setCooks(res.data || []);
    } catch (err) {
      showError('Failed to fetch home cooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooks();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await adminApi.approveCook(id);
      showSuccess('Home cook approved successfully!');
      await fetchCooks();
    } catch (err) {
      showError('Failed to approve cook');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      await adminApi.rejectCook(id);
      showSuccess('Home cook rejected');
      await fetchCooks();
    } catch (err) {
      showError('Failed to reject cook');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSuspend = async (id) => {
    setActionLoadingId(id);
    try {
      await adminApi.suspendCook(id);
      showSuccess('Home cook suspended');
      await fetchCooks();
    } catch (err) {
      showError('Failed to suspend cook');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Home Cook Partner Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Verify kitchen applications, manage approved home chef profiles, and review ratings
          </p>
        </div>

        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="ALL">All Kitchens</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Cooks Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kitchen & Chef</th>
              <th>Specialization</th>
              <th>Rating & Reviews</th>
              <th>Total Orders</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading home cooks...
                </td>
              </tr>
            ) : cooks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No home cooks match the filter.
                </td>
              </tr>
            ) : (
              cooks.map((c) => {
                const isProcessing = actionLoadingId === c.id;

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#ffedd5',
                          color: '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          flexShrink: 0,
                        }}>
                          👨‍🍳
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.kitchen_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Chef {c.name} · {c.phone || c.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {c.specialization || 'Homestyle Multi-cuisine'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ fontWeight: 700 }}>{c.rating?.toFixed(1)}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({c.total_reviews} reviews)</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.total_orders}</span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: c.approval_status === 'APPROVED' ? '#dcfce7' :
                                         c.approval_status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        color: c.approval_status === 'APPROVED' ? '#15803d' :
                               c.approval_status === 'PENDING' ? '#b45309' : '#b91c1c',
                      }}>
                        {c.approval_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {c.approval_status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(c.id)}
                              disabled={isProcessing}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              disabled={isProcessing}
                              className="btn btn-danger btn-sm"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {c.approval_status === 'APPROVED' && (
                          <button
                            onClick={() => handleSuspend(c.id)}
                            disabled={isProcessing}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <Ban size={14} />
                            <span>Suspend</span>
                          </button>
                        )}

                        {c.approval_status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleApprove(c.id)}
                            disabled={isProcessing}
                            className="btn btn-success btn-sm"
                          >
                            <Check size={14} />
                            <span>Reactivate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cooks;
