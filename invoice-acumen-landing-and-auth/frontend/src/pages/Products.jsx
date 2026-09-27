import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get('/products')
      .then((res) => {
        if (!cancelled) setProducts(res.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        if (!cancelled) {
          setError(
            err.response
              ? `Server error (${err.response.status}). Please try again.`
              : 'Could not reach the server. Check your connection and that the backend is running.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const [message, setMessage] = useState('');

  const addToCart = (product) => {
    const existing = cart.find((c) => c.productId === product.id);
    let updated;
    if (existing) {
      updated = cart.map((c) => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      updated = [...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    }
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));

    setMessage(`${product.name} added to cart`);
    window.setTimeout(() => setMessage(''), 2000);
  };


  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Products</h2>
        {message && (
          <div className="mb-4 text-sm rounded-lg bg-evo-violet/10 text-evo-violet border border-evo-violet/25 px-4 py-2">
            {message}
          </div>
        )}

        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="evo-input evo-focus-ring rounded-lg px-3 py-2 mb-6 w-full max-w-md text-sm"
        />

        {loading && (
          <p className="text-evo-muted text-sm">Loading products…</p>
        )}

        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5">
            <p className="text-red-400 font-medium">Couldn&apos;t load products</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="evo-card p-6 text-center">
            <p className="text-white font-medium">No products found</p>
            <p className="text-evo-muted text-sm mt-1">
              {products.length === 0
                ? 'The catalog is empty right now.'
                : 'Try a different search term.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="evo-card p-4 flex flex-col">
              <h3 className="font-semibold text-lg text-white">{p.name}</h3>
              <p className="text-evo-muted text-sm">{p.category}</p>
              <p className="text-evo-muted/70 text-xs mt-1">{p.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold evo-gradient-text">₹{p.price}</span>
                <span className={`text-xs ${p.stockQuantity < p.reorderThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
                  {p.stockQuantity} in stock
                </span>
              </div>
              {user?.role === 'CUSTOMER' && (
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stockQuantity === 0}
                  className="evo-btn-primary evo-focus-ring mt-3 py-1.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {p.stockQuantity === 0 ? 'Out of stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
