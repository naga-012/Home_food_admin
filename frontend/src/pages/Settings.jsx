import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  Database, 
  Play 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../services/api';

const Settings = () => {
  const { 
    admin, 
    soundEnabled, 
    toggleSound, 
    autoRefresh, 
    toggleAutoRefresh, 
    playNotificationSound 
  } = useAuth();

  const { showSuccess } = useToast();

  const handleTestChime = () => {
    playNotificationSound();
    showSuccess('Playing order notification sound test!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Portal Settings & Preferences
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Manage admin workspace sound notifications, polling behavior, and view server connections
        </p>
      </div>

      {/* Administrator Profile Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#ea580c" />
          <span>Administrator Profile</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Admin Name</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginTop: '2px' }}>
              {admin?.name || 'Administrator'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
              {admin?.email || 'admin@intiruchi.com'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Access Role</div>
            <div style={{ marginTop: '2px' }}>
              <span style={{
                backgroundColor: '#ffedd5',
                color: '#ea580c',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}>
                {admin?.role || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio & Polling Preferences */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
          Alerts & Real-Time Sync
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sound Notification */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Audio Chime for New Orders</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Plays a pleasant synthesized two-tone chime whenever a new order is received
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleTestChime}
                className="btn btn-outline btn-sm"
                title="Test notification sound"
              >
                <Play size={13} />
                <span>Test Sound</span>
              </button>

              <button
                onClick={toggleSound}
                className={`btn ${soundEnabled ? 'btn-success' : 'btn-outline'} btn-sm`}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{soundEnabled ? 'Sound Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

          {/* Auto Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Live Background Polling</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Automatically refreshes orders and KPI metrics every 5-6 seconds without manual page reload
              </div>
            </div>

            <button
              onClick={toggleAutoRefresh}
              className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
              <span>{autoRefresh ? 'Active (5s)' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend & Database Connection Status */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={20} color="#0284c7" />
          <span>Architecture & Database Connection</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>Backend Server:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>{API_BASE_URL}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>Customer App:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>https://inti-ruchi-frontend.onrender.com</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>Database Engine:</span>
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Unified PostgreSQL Database · Single Source of Truth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
