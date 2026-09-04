import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  PieChart, 
  Flame, 
  Calendar 
} from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const Reports = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [revRes, ordRes] = await Promise.all([
          adminApi.getRevenueReport(),
          adminApi.getOrdersReport(),
        ]);
        setRevenueData(revRes.data);
        setOrdersData(ordRes.data);
      } catch (err) {
        showError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading analytics and financial reports...</div>;
  }

  const rev = revenueData || {};
  const ord = ordersData || {};
  const revTrend = rev.daily_revenue_trend || [];
  const ordTrend = ord.daily_orders_trend || [];
  const statusDist = ord.status_distribution || {};
  const popularFoods = ord.popular_foods || [];
  const popularCategories = ord.popular_categories || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Revenue & Performance Reports
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Real financial metrics and order velocity calculated directly from the database
        </p>
      </div>

      {/* Revenue KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Today's Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            ₹{rev.today_revenue?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '6px', fontWeight: 600 }}>Active Daily Volume</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Weekly Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            ₹{rev.weekly_revenue?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Last 7 days</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Monthly Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            ₹{rev.monthly_revenue?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Last 30 days</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>All-Time Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
            ₹{rev.total_revenue?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Total settled orders</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
      }}>
        {/* Daily Revenue Trend Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Daily Revenue (Last 7 Days)</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Settled orders grouped by calendar day</p>
          </div>

          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
            {revTrend.map((day, idx) => {
              const maxVal = Math.max(...revTrend.map((d) => d.revenue), 100);
              const heightPct = Math.max(12, Math.round((day.revenue / maxVal) * 100));

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                    ₹{day.revenue.toFixed(0)}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: '#ea580c',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Orders Volume Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Orders Placed (Last 7 Days)</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Volume of orders submitted by customers</p>
          </div>

          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
            {ordTrend.map((day, idx) => {
              const maxVal = Math.max(...ordTrend.map((d) => d.count), 5);
              const heightPct = Math.max(15, Math.round((day.count / maxVal) * 100));

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0284c7' }}>
                    {day.count}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: '#0284c7',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Foods & Order Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
      }}>
        {/* Top Food Items */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Flame size={20} color="#ea580c" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Top Most Popular Dishes</h3>
          </div>

          {popularFoods.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No item order history yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {popularFoods.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#ffedd5' : '#f1f5f9',
                      color: idx === 0 ? '#ea580c' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.orders} orders</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>₹{item.sales}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PieChart size={20} color="#7c3aed" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Orders Distribution by Status</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(statusDist).map(([statusKey, count]) => {
              const totalOrders = ord.total_orders || 1;
              const pct = Math.round((count / totalOrders) * 100);

              return (
                <div key={statusKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{statusKey}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: statusKey === 'DELIVERED' ? '#16a34a' :
                                       statusKey === 'PENDING' ? '#f59e0b' :
                                       statusKey === 'ACCEPTED' ? '#0284c7' :
                                       statusKey === 'PREPARING' ? '#38bdf8' :
                                       statusKey === 'REJECTED' ? '#dc2626' : '#94a3b8',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
