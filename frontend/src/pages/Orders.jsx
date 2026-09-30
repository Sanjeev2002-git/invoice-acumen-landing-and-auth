import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../components/RequestState';

const PAYMENT_LABELS = {
  COD: 'Cash on Delivery',
  UPI: 'UPI',
  UPI_MANUAL: 'UPI (Manual)',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  NET_BANKING: 'Net Banking',
  BANK_TRANSFER: 'Bank Transfer',
};

const TRACKING_STAGES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STAGE_LABELS = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
};

function TrackingBar({ status }) {
  if (status === 'CANCELLED') {
    return <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">Cancelled</span>;
  }
  const currentIndex = TRACKING_STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {TRACKING_STAGES.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${i <= currentIndex ? 'bg-evo-violet' : 'bg-white/15'}`} />
            <span className={`text-[10px] mt-1 whitespace-nowrap ${i <= currentIndex ? 'text-white' : 'text-evo-muted/60'}`}>{STAGE_LABELS[stage]}</span>
          </div>
          {i < TRACKING_STAGES.length - 1 && (
            <div className={`h-0.5 w-6 shrink-0 ${i < currentIndex ? 'bg-evo-violet' : 'bg-white/15'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = () => {
    setLoading(true);
    setError('');

    if (user.role === 'ADMIN') {
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      api
        .get('/orders/search', { params })
        .then((res) => setOrders(res.data.data || []))
        .catch((err) => {
          console.error('Failed to load orders:', err);
          setError(
            err.response
              ? `Server error (${err.response.status}). Please try again.`
              : 'Could not reach the server. Check your connection and that the backend is running.'
          );
        })
        .finally(() => setLoading(false));
    } else {
      api
        .get('/orders/my')
        .then((res) => setOrders(res.data.data || []))
        .catch((err) => {
          console.error('Failed to load orders:', err);
          setError(
            err.response
              ? `Server error (${err.response.status}). Please try again.`
              : 'Could not reach the server. Check your connection and that the backend is running.'
          );
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);


  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      setError('');
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Order status could not be updated.'));
    } finally {
      setUpdating(false);
    }
  };

  const updatePayment = async (orderId, paymentStatus) => {
    try {
      setUpdating(true);
      setError('');
      await api.patch(`/orders/${orderId}/status`, { paymentStatus });
      fetchOrders();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Payment status could not be updated.'));
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    try {
      setUpdating(true);
      await api.patch(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to cancel order'));
    } finally {
      setUpdating(false);
    }
  };

  const reorder = (order) => {
    const cartItems = (order.items || []).map((item) => ({
      productId: item.product?.id,
      name: item.product?.name,
      price: item.unitPrice,
      quantity: item.quantity,
    })).filter((c) => c.productId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  const downloadInvoice = async (order) => {
    const res = await api.get(`/orders/${order.id}/invoice`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${order.invoiceNumber || order.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">
          {user.role === 'ADMIN' ? 'Order Management' : 'My Orders'}
        </h2>

        {loading && (
          <p className="text-evo-muted text-sm">Loading orders…</p>
        )}

        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5">
            <p className="text-red-400 font-medium">Couldn&apos;t load orders</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}


        {user.role === 'ADMIN' && (
          <div className="evo-card p-3 mb-4 flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Search by customer name, order number, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="evo-input evo-focus-ring flex-1 rounded px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="evo-input evo-focus-ring rounded px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s] || s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-4">
          {user.role === 'ADMIN' && (
            <div className="evo-card p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-evo-muted">
                Tip: Use search and status filters to narrow down orders.
              </p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="evo-card p-6 text-center">
              <p className="text-white font-medium">No orders yet</p>
              <p className="text-evo-muted text-sm mt-1">You&apos;re all caught up.</p>
            </div>
          )}

          {orders.map((o) => (
            <div key={o.id} className="evo-card p-4">


              <div className="flex justify-between items-center mb-2">


                <span className="font-semibold text-white">Order #{o.orderNumber || o.id}</span>
                <span className="text-sm text-evo-muted">{new Date(o.orderDate).toLocaleString()}</span>
              </div>
              {user.role === 'ADMIN' && (
                <p className="text-sm text-evo-muted mb-1">Customer: {o.user?.name} · {o.user?.phone || o.deliveryAddress?.phone || '—'}</p>
              )}

              <div className="mb-3">
                <TrackingBar status={o.status} />
              </div>

              {o.deliveryAddress && (
                <div className="text-sm text-evo-muted mb-2 bg-white/5 rounded p-2">
                  <p className="font-medium text-white mb-0.5">Delivery Address</p>
                  <p>
                    {[o.deliveryAddress.houseNo, o.deliveryAddress.buildingName, o.deliveryAddress.streetNo, o.deliveryAddress.streetName, o.deliveryAddress.area].filter(Boolean).join(', ')}
                    , {o.deliveryAddress.city}, {o.deliveryAddress.state} - {o.deliveryAddress.pincode}
                  </p>
                </div>
              )}

              <div className="text-sm text-evo-muted mb-2 bg-white/5 rounded p-2">
                <p className="font-medium text-white mb-0.5">Payment Method</p>
                <p>{PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod || 'Not specified'}</p>
              </div>

              {expanded === o.id && (
                <ul className="text-sm text-evo-muted mb-2">
                  {o.items?.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product?.name} x {item.quantity}</span>
                      <span>₹{item.subtotal}</span>
                    </li>
                  ))}
                  <li className="flex justify-between pt-1 border-t border-white/10 mt-1">
                    <span>GST</span><span>₹{o.gstAmount ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Delivery Charge</span><span>{o.deliveryCharge > 0 ? `₹${o.deliveryCharge}` : 'FREE'}</span>
                  </li>
                </ul>
              )}

              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="font-bold text-white">Total: ₹{o.totalAmount}</span>
                <div className="flex gap-2 items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-evo-blue/15 text-evo-blue border border-evo-blue/25">{STAGE_LABELS[o.status] || o.status}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">{o.paymentStatus}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="evo-btn-secondary evo-focus-ring px-3 py-1.5 rounded-full text-xs">
                  {expanded === o.id ? 'Hide Details' : 'View Details'}
                </button>
                <button onClick={() => downloadInvoice(o)} className="evo-btn-secondary evo-focus-ring px-3 py-1.5 rounded-full text-xs">
                  Download Invoice
                </button>
                {user.role === 'CUSTOMER' && (
                  <button onClick={() => reorder(o)} className="evo-btn-secondary evo-focus-ring px-3 py-1.5 rounded-full text-xs">
                    Reorder
                  </button>
                )}
                {user.role === 'CUSTOMER' && ['PENDING', 'CONFIRMED'].includes(o.status) && (
                  <button onClick={() => cancelOrder(o.id)} disabled={updating} className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 disabled:opacity-60">
                    Cancel Order
                  </button>
                )}
              </div>

              {user.role === 'ADMIN' && (
                <div className="flex gap-3 mt-3">
                  <select
                    defaultValue={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={updating}
                    className="evo-input evo-focus-ring rounded px-2 py-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
                      <option key={s} value={s}>{STAGE_LABELS[s] || s}</option>
                    ))}
                  </select>
                  <select
                    defaultValue={o.paymentStatus}
                    onChange={(e) => updatePayment(o.id, e.target.value)}
                    disabled={updating}
                    className="evo-input evo-focus-ring rounded px-2 py-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
