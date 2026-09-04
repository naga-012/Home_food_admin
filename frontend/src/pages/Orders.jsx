import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  RefreshCw, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import OrderTable from '../components/OrderTable';
import ConfirmModal from '../components/ConfirmModal';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);

  const { autoRefresh, setPendingCount } = useAuth();
  const { showSuccess, showError } = useToast();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync URL search params
  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatusFilter(s.toUpperCase());
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const fetchOrders = useCallback(async () => {
    try {
      const params = {
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        payment_status: paymentFilter !== 'ALL' ? paymentFilter : undefined,
        date_filter: dateFilter !== 'all' ? dateFilter : undefined,
        sort_by: sortBy,
        search: debouncedSearch.trim() || undefined,
      };

      const res = await adminApi.getOrders(params);
      const data = res.data;
      setOrders(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);

      // Check pending count for badge
      const pendingCount = (data.items || []).filter((o) => o.order_status === 'PENDING').length;
      if (statusFilter === 'ALL' || statusFilter === 'PENDING') {
        setPendingCount(data.items.filter((o) => o.order_status === 'PENDING').length);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, paymentFilter, dateFilter, sortBy, debouncedSearch, setPendingCount]);

  useEffect(() => {
    fetchOrders();
    let interval = null;
    if (autoRefresh && !rejectModalOpen) {
      interval = setInterval(fetchOrders, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchOrders, autoRefresh, rejectModalOpen]);

  const handleAccept = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await adminApi.acceptOrder(orderId);
      showSuccess(`Order #${orderId} accepted successfully!`);
      await fetchOrders();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to accept order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (orderId, orderNum) => {
    setOrderToReject({ id: orderId, number: orderNum });
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason) => {
    if (!orderToReject) return;
    setActionLoadingId(orderToReject.id);
    try {
      await adminApi.rejectOrder(orderToReject.id, reason);
      showSuccess(`Order #${orderToReject.number} rejected`);
      setRejectModalOpen(false);
      setOrderToReject(null);
      await fetchOrders();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to reject order');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header with Action Counters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Live Orders Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing real orders created by customers from the INTI RUCHI customer website
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="btn btn-outline btn-sm"
          style={{ gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending (Action Needed)</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              className="form-select"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Payment Pending</option>
              <option value="FAILED">Payment Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              className="form-select"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_amount">Highest Amount</option>
              <option value="lowest_amount">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onAccept={handleAccept}
        onReject={openRejectModal}
        actionLoadingId={actionLoadingId}
      />

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{orders.length}</strong> of <strong>{total}</strong> orders (Page {page} of {totalPages})
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 8px' }}>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn btn-outline btn-sm"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        title={`Reject Order #${orderToReject?.number}?`}
        message="Please select or enter the rejection reason. The customer will immediately see this updated status and reason on their orders screen."
        confirmText="Confirm Rejection"
        confirmVariant="danger"
        isRejectModal={true}
        loading={actionLoadingId === orderToReject?.id}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setOrderToReject(null);
        }}
      />
    </div>
  );
};

export default Orders;
