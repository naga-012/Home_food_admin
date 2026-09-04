import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  ChefHat, 
  UtensilsCrossed, 
  Tags, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'orders' },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/cooks', label: 'Home Cooks', icon: ChefHat },
  { path: '/admin/foods', label: 'Foods Menu', icon: UtensilsCrossed },
  { path: '/admin/categories', label: 'Categories', icon: Tags },
  { path: '/admin/reports', label: 'Reports & Revenue', icon: BarChart3 },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { admin, logout, pendingCount } = useAuth();

  return (
    <aside style={{
      width: collapsed ? '80px' : '260px',
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-sidebar)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 40,
      borderRight: '1px solid #1e293b',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
            flexShrink: 0,
          }}>
            🍲
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ 
                fontWeight: 800, 
                fontSize: '1.05rem', 
                color: '#ffffff', 
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>
                INTI RUCHI
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#ea580c', 
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <ShieldCheck size={12} />
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto',
      }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : 'var(--text-sidebar)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.15s ease',
                position: 'relative',
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
              {item.badgeKey === 'orders' && pendingCount > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: collapsed ? '2px 5px' : '2px 7px',
                  borderRadius: '9999px',
                  lineHeight: 1,
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                  position: collapsed ? 'absolute' : 'static',
                  top: collapsed ? '4px' : 'auto',
                  right: collapsed ? '4px' : 'auto',
                }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle when collapsed */}
      {collapsed && (
        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Admin User Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px',
      }}>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {admin?.name || 'Administrator'}
            </div>
            <div style={{
              fontSize: '0.725rem',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {admin?.email || 'admin@intiruchi.com'}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
          }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
