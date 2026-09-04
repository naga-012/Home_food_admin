import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const REJECTION_REASONS = [
  'Food unavailable / Out of stock',
  'Delivery partner unavailable',
  'Kitchen closed / High volume',
  'Payment verification problem',
  'Address outside serviceable area',
  'Other (Custom Reason)',
];

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'success'
  isRejectModal = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(REJECTION_REASONS[0]);
      setCustomReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isRejectModal) {
      const finalReason = selectedReason === 'Other (Custom Reason)' 
        ? (customReason.trim() || 'Order unavailable') 
        : selectedReason;
      onConfirm(finalReason);
    } else {
      onConfirm();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px',
      animation: 'fadeIn 0.15s ease-out',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: confirmVariant === 'danger' ? '#fee2e2' : '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: confirmVariant === 'danger' ? '#dc2626' : '#ea580c',
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
            {message}
          </p>

          {isRejectModal && (
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Select Rejection Reason
              </label>
              <select
                className="form-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ marginBottom: '12px' }}
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {selectedReason === 'Other (Custom Reason)' && (
                <input
                  type="text"
                  placeholder="Enter specific reason for rejection..."
                  className="form-input"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
