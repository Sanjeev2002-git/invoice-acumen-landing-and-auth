import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RevenueChart from '../components/RevenueChart';
import StockTable from '../components/StockTable';

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState({ weekly: 0, monthly: 0, yearly: 0 });
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = () => {
    setLoading(true);
    setError('');

    Promise.all([
      api.get('/admin/revenue'),
      api.get('/products'),
      api.get('/admin/low-stock'),
      api.get('/orders'),
    ])
      .then(([revenueRes, productsRes, lowStockRes, ordersRes]) => {
        setRevenue(revenueRes.data.data || { weekly: 0, monthly: 0, yearly: 0 });
        setProducts(productsRes.data.data || []);
        setLowStock(lowStockRes.data.data || []);
        setOrders(ordersRes.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load admin dashboard:', err);
        setError(
          err.response
            ? `Server error (${err.response.status}). Please try again.`
            : 'Could not reach the server. Check your connection and that the backend is running.'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>

        {loading && <p className="text-evo-muted text-sm">Loading dashboard…</p>}

        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5">
            <p className="text-red-400 font-medium">Couldn&apos;t load dashboard</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="evo-card p-5">
            <p className="text-sm text-evo-muted">This Week</p>
            <p className="evo-gradient-text text-2xl font-bold">₹{revenue.weekly}</p>
          </div>
          <div className="evo-card p-5">
            <p className="text-sm text-evo-muted">This Month</p>
            <p className="evo-gradient-text text-2xl font-bold">₹{revenue.monthly}</p>
          </div>
          <div className="evo-card p-5">
            <p className="text-sm text-evo-muted">This Year</p>
            <p className="evo-gradient-text text-2xl font-bold">₹{revenue.yearly}</p>
          </div>
          <div className="evo-card p-5">
            <p className="text-sm text-evo-muted">Total Orders</p>
            <p className="evo-gradient-text text-2xl font-bold">{orders.length}</p>
          </div>
        </div>

        {!loading && !error && (
          <>
            <RevenueChart revenue={revenue} />

            {lowStock.length > 0 ? (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-4">
                <p className="font-semibold text-red-400 mb-1">Low Stock Alert</p>
                <p className="text-sm text-red-300">
                  {lowStock.map((p) => p.name).join(', ')} {lowStock.length > 1 ? 'are' : 'is'} running low.
                </p>
              </div>
            ) : (
              <div className="evo-card p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                <p className="text-evo-muted text-sm">No low-stock items right now.</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Inventory &amp; Restocking</h3>
              {products.length === 0 ? (
                <div className="evo-card p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                  <p className="text-evo-muted text-sm">No products available.</p>
                </div>
              ) : (
                <StockTable products={products} onRestock={fetchAll} />
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
