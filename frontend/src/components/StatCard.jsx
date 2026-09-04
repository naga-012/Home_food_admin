import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#ea580c', bgLight = '#fff7ed', subtitle, onClick }) => {
  return (
    <div 
      className="card"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: color,
      }} />

      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: bgLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatCard;
