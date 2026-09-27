import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/orders/my')
      .then((res) => setOrderCount(res.data.data?.length || 0))
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setError(
          err.response
            ? `Server error (${err.response.status}). Please try again.`
            : 'Could not reach the server. Check your connection and that the backend is running.'
        );
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-2 text-white">
          Welcome back, <span className="evo-gradient-text">{user.name}</span>
        </h2>
        <p className="text-evo-muted mb-6">Here&apos;s a quick overview of your account.</p>

        {loading && (
          <p className="text-evo-muted text-sm">Loading your dashboard…</p>
        )}

        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5 mb-6">
            <p className="text-red-400 font-medium">Couldn&apos;t load your dashboard</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="evo-card p-5">
              <p className="text-sm text-evo-muted">Total Orders</p>
              <p className="evo-gradient-text text-2xl font-bold">{orderCount}</p>
            </div>
          </div>
        )}

        {!loading && !error && orderCount === 0 && (
          <div className="evo-card p-6 text-center mb-8">
            <p className="text-white font-medium">No orders yet</p>
            <p className="text-evo-muted text-sm mt-1">Browse products to place your first order.</p>
          </div>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/products" className="evo-card p-5">
            <h3 className="font-semibold text-white">Browse Products</h3>
            <p className="text-sm text-evo-muted">Shop from our full catalog</p>
          </Link>
          <Link to="/orders" className="evo-card p-5">
            <h3 className="font-semibold text-white">Track Orders</h3>
            <p className="text-sm text-evo-muted">View order status and history</p>
          </Link>
          <Link to="/payment-methods" className="evo-card p-5">
            <h3 className="font-semibold text-white">Payment Methods</h3>
            <p className="text-sm text-evo-muted">Manage how you pay</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
