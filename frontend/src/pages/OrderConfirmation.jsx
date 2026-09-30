import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const PAYMENT_LABELS = {
  COD: 'Cash on Delivery',
  UPI: 'UPI',
  UPI_MANUAL: 'UPI (Manual)',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  NET_BANKING: 'Net Banking',
  BANK_TRANSFER: 'Bank Transfer',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Order not found'));
  }, [id]);

  const downloadInvoice = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="evo-page relative min-h-screen">
        <div className="relative z-10 max-w-2xl mx-auto p-6">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="evo-page relative min-h-screen">
        <div className="relative z-10 max-w-2xl mx-auto p-6">
          <p className="text-evo-muted">Loading order...</p>
        </div>
      </div>
    );
  }

  const addr = order.deliveryAddress;

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-2xl mx-auto p-6">
        <div className="evo-card p-6 text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-3">✓</div>
          <h2 className="text-2xl font-bold text-white mb-1">Order Placed Successfully</h2>
          <p className="text-evo-muted text-sm">Thank you — we&apos;ve received your order.</p>
        </div>

        <div className="evo-card p-4 mb-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-evo-muted">Order Number</span><span className="text-white font-medium">{order.orderNumber || order.id}</span></div>
          <div className="flex justify-between"><span className="text-evo-muted">Invoice Number</span><span className="text-white font-medium">{order.invoiceNumber || '—'}</span></div>
          <div className="flex justify-between"><span className="text-evo-muted">Expected Delivery</span><span className="text-white font-medium">{order.expectedDeliveryDate || '—'}</span></div>
          <div className="flex justify-between"><span className="text-evo-muted">Payment Method</span><span className="text-white font-medium">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span></div>
        </div>

        {addr && (
          <div className="evo-card p-4 mb-4 text-sm">
            <p className="font-medium text-white mb-1">Delivery Address</p>
            <p className="text-evo-muted">{addr.fullName} · {addr.phone}</p>
            <p className="text-evo-muted">{[addr.houseNo, addr.buildingName, addr.streetNo, addr.streetName, addr.area].filter(Boolean).join(', ')}</p>
            <p className="text-evo-muted">{addr.city}, {addr.state} - {addr.pincode}, {addr.country}</p>
          </div>
        )}

        <div className="evo-card p-4 mb-4">
          <p className="font-medium text-white mb-2 text-sm">Products</p>
          <ul className="text-sm text-evo-muted space-y-1">
            {order.items?.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.product?.name} x {item.quantity}</span>
                <span>₹{item.subtotal}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 mt-3 pt-3 space-y-1 text-sm text-evo-muted">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotalAmount}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between"><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
            <div className="flex justify-between"><span>GST</span><span>₹{order.gstAmount}</span></div>
            <div className="flex justify-between"><span>Delivery Charge</span><span>{order.deliveryCharge > 0 ? `₹${order.deliveryCharge}` : 'FREE'}</span></div>
            <div className="flex justify-between text-white font-bold text-base pt-1"><span>Grand Total</span><span>₹{order.totalAmount}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={downloadInvoice} disabled={downloading} className="evo-btn-primary evo-focus-ring px-5 py-2 rounded-full disabled:opacity-60">
            {downloading ? 'Downloading...' : 'Download Invoice'}
          </button>
          <button onClick={() => navigate('/products')} className="evo-btn-secondary evo-focus-ring px-5 py-2 rounded-full">
            Continue Shopping
          </button>
          <Link to="/orders" className="evo-btn-secondary evo-focus-ring px-5 py-2 rounded-full inline-flex items-center">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
