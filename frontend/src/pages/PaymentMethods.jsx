import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from '../components/RequestState';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState('UPI_MANUAL');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMethods = () => {
    setLoading(true);
    setError('');
    api
      .get('/payment-methods')
      .then((res) => setMethods(res.data.data || []))
      .catch((err) => {
        console.error('Failed to load payment methods:', err);
        setError(
          err.response
            ? `Server error (${err.response.status}). Please try again.`
            : 'Could not reach the server. Check your connection and that the backend is running.'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.post('/payment-methods', { type, details });
      setDetails('');
      fetchMethods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Payment method could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError('');
      await api.delete(`/payment-methods/${id}`);
      fetchMethods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Payment method could not be deleted.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Payment Methods</h2>
        <p className="text-sm text-evo-muted mb-4">
          No online gateway is used. These are stored for reference — orders are settled via Cash on Delivery,
          UPI (manual), or Bank Transfer, and marked as paid by the admin once confirmed.
        </p>

        {loading && <p className="text-evo-muted text-sm mb-4">Loading payment methods…</p>}

        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5 mb-6">
            <p className="text-red-400 font-medium">Couldn&apos;t load payment methods</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && methods.length === 0 && (
          <div className="evo-card p-5 mb-6 text-center">
            <p className="text-evo-muted">No payment methods added yet.</p>
          </div>
        )}

        {!loading && !error && methods.length > 0 && (
          <div className="evo-card divide-y divide-white/10 mb-6">
            {methods.map((m) => (
              <div key={m.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{m.type.replace('_', ' ')}</p>
                  <p className="text-sm text-evo-muted">{m.details}</p>
                </div>
                <button disabled={deletingId === m.id} onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 text-sm disabled:opacity-60">
                  {deletingId === m.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="evo-card p-4 space-y-3">
          <h3 className="font-semibold mb-2 text-white">Add Payment Method</h3>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="evo-input evo-focus-ring w-full rounded px-3 py-2 text-sm"
          >
            <option value="UPI_MANUAL">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="COD">Cash on Delivery</option>
          </select>
          <input
            placeholder="e.g. UPI ID, or Bank name & account number"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="evo-input evo-focus-ring w-full rounded px-3 py-2 text-sm"
          />
          <button type="submit" disabled={saving} className="evo-btn-primary evo-focus-ring px-5 py-2 rounded-full disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

