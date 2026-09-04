import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { autoRefresh, playNotificationSound, setPendingCount } = useAuth();
  const { showInfo } = useToast();
  const prevPendingRef = useRef(null);
  const location = useLocation();

  // Polling loop for new orders arrival
  useEffect(() => {
    let timer = null;

    const checkNewOrders = async () => {
      try {
        const res = await adminApi.getDashboard();
        const pendingNow = res.data?.statistics?.pending_orders || 0;
        setPendingCount(pendingNow);

        if (prevPendingRef.current !== null && pendingNow > prevPendingRef.current) {
          const diff = pendingNow - prevPendingRef.current;
          playNotificationSound();
          showInfo(`🔔 ${diff} new order${diff > 1 ? 's' : ''} received!`);
        }

        prevPendingRef.current = pendingNow;
      } catch (err) {
        // silently ignore polling network hiccups
      }
    };

    checkNewOrders();

    if (autoRefresh) {
      timer = setInterval(checkNewOrders, 6000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, playNotificationSound, setPendingCount, showInfo]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main style={{
          flex: 1,
          padding: '28px',
          overflowY: 'auto',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
