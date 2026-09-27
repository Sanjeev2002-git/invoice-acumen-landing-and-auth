import React, { useState } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from './RequestState';

export default function StockTable({ products, onRestock }) {
  const [restockAmounts, setRestockAmounts] = useState({});
  const [restockingId, setRestockingId] = useState(null);
  const [error, setError] = useState('');

  const handleRestock = async (productId) => {
    const qty = parseInt(restockAmounts[productId]) || 0;
    if (qty <= 0) {
      setError('Enter a restock quantity of at least 1.');
      return;
    }
    try {
      setRestockingId(productId);
      setError('');
      await api.patch(`/admin/products/${productId}/restock`, { quantity: qty, note: 'Manual restock by admin' });
      setRestockAmounts({ ...restockAmounts, [productId]: '' });
      onRestock();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Stock could not be updated.'));
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="evo-card overflow-x-auto">
      {error && <p className="m-3 text-sm text-red-400" role="alert">{error}</p>}
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-evo-muted">
          <tr>
            <th className="p-3 font-medium">Product</th>
            <th className="p-3 font-medium">Category</th>
            <th className="p-3 font-medium">Price</th>
            <th className="p-3 font-medium">Stock</th>
            <th className="p-3 font-medium">Restock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-white/10 hover:bg-white/[0.03] transition">
              <td className="p-3 text-white">{p.name}</td>
              <td className="p-3 text-evo-muted">{p.category}</td>
              <td className="p-3 text-evo-muted">₹{p.price}</td>
              <td className={`p-3 font-medium ${p.stockQuantity < p.reorderThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
                {p.stockQuantity}
              </td>
              <td className="p-3 flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={restockAmounts[p.id] || ''}
                  onChange={(e) => setRestockAmounts({ ...restockAmounts, [p.id]: e.target.value })}
                  className="evo-input evo-focus-ring w-20 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleRestock(p.id)}
                  disabled={restockingId === p.id}
                  className="evo-btn-primary evo-focus-ring px-3 py-1 rounded-full text-xs"
                >
                  {restockingId === p.id ? 'Updating…' : 'Add Stock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
