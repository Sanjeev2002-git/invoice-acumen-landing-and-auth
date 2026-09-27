import React, { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  fullName: '', phone: '', email: '',
  houseNo: '', buildingName: '', streetNo: '', streetName: '', area: '', landmark: '',
  city: '', state: '', pincode: '', country: 'India', addressType: 'HOME', default: false,
};

function formatAddress(a) {
  const houseLine = [a.houseNo, a.buildingName, a.streetNo, a.streetName].filter(Boolean).join(', ');
  const areaLine = [a.area, a.landmark ? `near ${a.landmark}` : null].filter(Boolean).join(', ');
  return `${houseLine}${areaLine ? `, ${areaLine}` : ''}`;
}

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAddresses = () => {
    setLoading(true);
    setError('');
    api
      .get('/addresses')
      .then((res) => setAddresses(res.data.data || []))
      .catch((err) => {
        console.error('Failed to load addresses:', err);
        setError(
          err.response
            ? `Server error (${err.response.status}). Please try again.`
            : 'Could not reach the server. Check your connection and that the backend is running.'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Mobile number must be exactly 10 digits';
    if (!form.houseNo.trim()) errs.houseNo = 'Required';
    if (!form.streetName.trim()) errs.streetName = 'Required';
    if (!form.area.trim()) errs.area = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state.trim()) errs.state = 'Required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'PIN code must be exactly 6 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await api.post('/addresses', form);
      setForm(emptyForm);
      setErrors({});
      setMessage('Address added');
      fetchAddresses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete address');
      window.setTimeout(() => setMessage(''), 2500);
    }
  };

  const field = (name, placeholder, extra = {}) => (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        className="evo-input evo-focus-ring w-full rounded px-3 py-2 text-sm"
        {...extra}
      />
      {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Addresses</h2>

        {loading && <p className="text-evo-muted text-sm mb-4">Loading addresses…</p>}


        {!loading && error && (
          <div className="evo-card p-5 border border-red-500/30 bg-red-500/5 mb-6">
            <p className="text-red-400 font-medium">Couldn&apos;t load addresses</p>
            <p className="text-evo-muted text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="evo-card p-4 mb-6 text-center">
            <p className="text-evo-muted">No addresses added yet.</p>
          </div>
        )}

        {!loading && !error && addresses.length > 0 && (
          <div className="evo-card divide-y divide-white/10 mb-6">
            {addresses.map((a) => (
              <div key={a.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{a.fullName} · {a.phone}</p>
                  <p className="text-sm text-evo-muted">{formatAddress(a)}</p>
                  <p className="text-sm text-evo-muted">
                    {a.city}, {a.state} - {a.pincode}, {a.country}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-evo-blue/15 text-evo-blue border border-evo-blue/25">
                      {a.addressType}
                    </span>
                    {a.default && <span className="text-xs text-emerald-400">Default</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 text-sm">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="evo-card p-4 space-y-4">
          <h3 className="font-semibold text-white">Add New Address</h3>
          {message && <p className="text-sm text-evo-violet">{message}</p>}

          <div>
            <p className="text-xs uppercase tracking-wide text-evo-muted mb-2">Customer Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {field('fullName', 'Full Name')}
              {field('phone', 'Mobile Number (10 digits)')}
            </div>
            <div className="mt-3">{field('email', 'Email Address (optional)')}</div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-evo-muted mb-2">Delivery Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {field('houseNo', 'House / Flat No.')}
              {field('buildingName', 'Building Name (optional)')}
              {field('streetNo', 'Street No. (optional)')}
              {field('streetName', 'Street Name')}
              {field('area', 'Area / Locality')}
              {field('landmark', 'Landmark (optional)')}
              {field('city', 'City')}
              {field('state', 'State')}
              {field('pincode', 'PIN Code (6 digits)')}
              {field('country', 'Country')}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-evo-muted mb-2">Address Type</p>
            <div className="flex gap-4">
              {['HOME', 'OFFICE', 'OTHER'].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-evo-muted">
                  <input
                    type="radio"
                    name="addressType"
                    value={t}
                    checked={form.addressType === t}
                    onChange={handleChange}
                  />
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-evo-muted">
            <input type="checkbox" name="default" checked={form.default} onChange={handleChange} />
            Set as default
          </label>
          <button type="submit" disabled={saving} className="evo-btn-primary evo-focus-ring px-5 py-2 rounded-full disabled:opacity-60">
            {saving ? 'Saving...' : 'Add Address'}
          </button>
        </form>
      </div>
    </div>
  );
}

