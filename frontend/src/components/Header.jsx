import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Search, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';

const Header = ({ title, subtitle, onSearch, sidebarCollapsed, setSidebarCollapsed }) => {
  const { admin, soundEnabled, toggleSound, autoRefresh, toggleAutoRefresh, pendingCount, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await adminApi.getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        // silently handle
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/admin/orders?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Page Title & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#475569',
          }}
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center/Search */}
      <div style={{ flex: '1', maxWidth: '420px', margin: '0 24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search 
            size={16} 
            color="#94a3b8" 
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            placeholder="Search orders, customers, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '38px',
              height: '40px',
              borderRadius: '9999px',
              backgroundColor: '#f8fafc',
              borderColor: '#e2e8f0',
              fontSize: '0.875rem',
            }}
          />
        </form>
      </div>

      {/* Right: Quick Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sound Notification Toggle */}
        <button
          onClick={toggleSound}
          className="btn btn-outline btn-sm"
          style={{
            borderRadius: '9999px',
            color: soundEnabled ? '#15803d' : '#64748b',
            borderColor: soundEnabled ? '#bbf7d0' : '#e2e8f0',
            backgroundColor: soundEnabled ? '#f0fdf4' : '#ffffff',
            gap: '6px',
            height: '36px',
          }}
          title={soundEnabled ? 'Order sound alert is ON' : 'Order sound alert is OFF'}
        >
          {soundEnabled ? <Volume2 size={16} color="#16a34a" /> : <VolumeX size={16} color="#94a3b8" />}
          <span style={{ fontSize: '0.775rem' }}>{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
        </button>

        {/* Auto Refresh Toggle */}
        <button
          onClick={toggleAutoRefresh}
          className="btn btn-outline btn-sm"
          style={{
            borderRadius: '9999px',
            color: autoRefresh ? '#ea580c' : '#64748b',
            borderColor: autoRefresh ? '#fed7aa' : '#e2e8f0',
            backgroundColor: autoRefresh ? '#fff7ed' : '#ffffff',
            gap: '6px',
            height: '36px',
          }}
          title={autoRefresh ? 'Live Polling every 5s is ON' : 'Auto Refresh is PAUSED'}
        >
          <RefreshCw size={15} color={autoRefresh ? '#ea580c' : '#94a3b8'} className={autoRefresh ? 'animate-spin' : ''} />
          <span style={{ fontSize: '0.775rem' }}>{autoRefresh ? 'Live (5s)' : 'Paused'}</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-subtle)',
              zIndex: 50,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  Notifications ({notifications.length})
                </div>
                <button
                  onClick={() => {
                    navigate('/admin/notifications');
                    setShowNotifMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View all
                </button>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.order_id) navigate(`/admin/orders/${n.order_id}`);
                        else if (n.cook_id) navigate('/admin/cooks');
                        setShowNotifMenu(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: n.type === 'NEW_ORDER' ? '#ffedd5' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {n.type === 'NEW_ORDER' ? '🔔' : '👨‍🍳'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {n.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 10px 4px 6px',
          borderRadius: '9999px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#ea580c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}>
            {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
            {admin?.name || 'Admin'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
