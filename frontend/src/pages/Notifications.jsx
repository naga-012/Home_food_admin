import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Clock, ChefHat, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await adminApi.getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Platform Notifications & Alerts
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Real-time system events, customer order dispatches, and partner registration updates
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
            Checking for administrative updates...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>All Caught Up</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              There are no pending alerts or unreviewed orders right now.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.order_id) navigate(`/admin/orders/${n.order_id}`);
                  else if (n.cook_id) navigate('/admin/cooks');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: n.type === 'NEW_ORDER' ? '#ffedd5' : '#e0f2fe',
                    color: n.type === 'NEW_ORDER' ? '#ea580c' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>
                    {n.type === 'NEW_ORDER' ? '🔔' : '👨‍🍳'}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ color: '#94a3b8' }}>
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
