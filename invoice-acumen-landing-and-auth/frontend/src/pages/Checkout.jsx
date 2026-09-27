import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GST_RATE = 0.18;
const DELIVERY_CHARGE = 49;
const FREE_DELIVERY_THRESHOLD = 500;

const emptyAddressForm = {
  fullName: '', phone: '', email: '',
  houseNo: '', buildingName: '', streetNo: '', streetName: '', area: '', landmark: '',
  city: '', state: '', pincode: '', country: 'India', addressType: 'HOME', default: false,
};

const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'NET_BANKING', label: 'Net Banking' },
];

export default function Checkout() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState('');


  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'review'
  const [message, setMessage] = useState('');
  const [placing, setPlacing] = useState(false);
  const [validatingCart, setValidatingCart] = useState(false);
  const [cartChanges, setCartChanges] = useState([]);
  const navigate = useNavigate();

  const fetchAddresses = () => {
    setLoadingAddresses(true);
    setAddressesError('');
    api
      .get('/addresses')
      .then((res) => {
        const data = res.data.data || [];
        setAddresses(data);
        const def = data.find((a) => a.default) || data[0];
        if (def && !selectedAddressId) setSelectedAddressId(String(def.id));
        if (data.length === 0) setShowAddressForm(true);
      })
      .catch((err) => {
        console.error('Failed to load addresses:', err);
        setAddressesError(
          err.response
            ? `Server error (${err.response.status}). Please try again.`
            : 'Could not reach the server. Check your connection and that the backend is running.'
        );
      })
      .finally(() => setLoadingAddresses(false));
  };


  useEffect(() => {
    if (cart.length === 0) {
      navigate('/products');
      return;
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = (productId, qty) => {
    const updated = cart.map((c) => c.productId === productId ? { ...c, quantity: Math.max(1, qty) } : c);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cart.filter((c) => c.productId !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    if (updated.length === 0) navigate('/products');
  };

  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.quantity, 0), [cart]);
  const gst = useMemo(() => Math.round(subtotal * GST_RATE * 100) / 100, [subtotal]);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = useMemo(() => Math.round((subtotal + gst + deliveryCharge) * 100) / 100, [subtotal, gst, deliveryCharge]);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({ ...addressForm, [name]: type === 'checkbox' ? checked : value });
  };

  const validateAddress = () => {
    const errs = {};
    if (!addressForm.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(addressForm.phone)) errs.phone = 'Mobile number must be exactly 10 digits';
    if (!addressForm.houseNo.trim()) errs.houseNo = 'Required';
    if (!addressForm.streetName.trim()) errs.streetName = 'Required';
    if (!addressForm.area.trim()) errs.area = 'Required';
    if (!addressForm.city.trim()) errs.city = 'Required';
    if (!addressForm.state.trim()) errs.state = 'Required';
    if (!/^\d{6}$/.test(addressForm.pincode)) errs.pincode = 'PIN code must be exactly 6 digits';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveNewAddress = async () => {
    if (!validateAddress()) return null;
    try {
      setSavingAddress(true);
      const res = await api.post('/addresses', addressForm);
      const saved = res.data.data;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(String(saved.id));
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
      return saved.id;
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save address');
      return null;
    } finally {
      setSavingAddress(false);
    }
  };

  const goToReview = async () => {
    setMessage('');
    let addressId = selectedAddressId;
    if (showAddressForm || !addressId) {
      addressId = await saveNewAddress();
      if (!addressId) return;
    }
    if (!(await validateCartBeforeCheckout())) return;
    setStep('review');
  };

  const selectedAddress = addresses.find((a) => String(a.id) === String(selectedAddressId));

  const persistCart = (updated) => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const validateCartBeforeCheckout = async () => {
    setValidatingCart(true);
    setMessage('');
    try {
      const checks = await Promise.all(cart.map(async (item) => {
        try {
          const response = await api.get(`/products/${item.productId}`);
          const product = response.data.data;
          const currentPrice = Number(product.price);
          const unavailable = !product || product.stockQuantity < item.quantity;
          const priceChanged = Number(item.price) !== currentPrice;
          return { item, product, unavailable, priceChanged, currentPrice };
        } catch (error) {
          if (error.response?.status === 404) {
            return { item, unavailable: true, priceChanged: false, product: null };
          }
          throw error;
        }
      }));
      const changes = checks.filter((check) => check.unavailable || check.priceChanged);
      setCartChanges(changes);
      if (changes.length > 0) {
        setMessage('Your cart changed since it was added. Review and acknowledge the changes before continuing.');
        return false;
      }
      return true;
    } catch (error) {
      setMessage(error.response?.data?.message || 'We could not verify current stock and prices. Please try again.');
      return false;
    } finally {
      setValidatingCart(false);
    }
  };

  const acknowledgeCartChanges = () => {
    const unavailableIds = new Set(cartChanges.filter((change) => change.unavailable).map((change) => change.item.productId));
    const revised = cart
      .filter((item) => !unavailableIds.has(item.productId))
      .map((item) => {
        const change = cartChanges.find((candidate) => candidate.item.productId === item.productId);
        return change?.priceChanged ? { ...item, price: change.currentPrice } : item;
      });
    persistCart(revised);
    setCartChanges([]);
    setMessage(revised.length
      ? 'Cart updated. Review your address and continue to checkout.'
      : 'Unavailable items were removed from your cart.');
    if (revised.length === 0) navigate('/products');
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setMessage('Please select a delivery address.');
      setStep('form');
      return;
    }
    try {
      setPlacing(true);
      if (!(await validateCartBeforeCheckout())) return;
      const res = await api.post('/orders', {
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponCode || undefined,
      });
      const order = res.data.data;
      localStorage.removeItem('cart');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const field = (name, placeholder, extra = {}) => (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        value={addressForm[name]}
        onChange={handleAddressChange}
        className="evo-input evo-focus-ring w-full rounded px-3 py-2 text-sm"
        {...extra}
      />
      {addressErrors[name] && <p className="text-xs text-red-400 mt-1">{addressErrors[name]}</p>}
    </div>
  );

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-1 text-white">Checkout</h2>
        <p className="text-sm text-evo-muted mb-6">{step === 'form' ? 'Step 1 of 2 — Delivery details' : 'Step 2 of 2 — Review your order'}</p>

        {message && (
          <div className="mb-4 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/25 px-4 py-2">
            {message}
          </div>
        )}

        {cartChanges.length > 0 && (
          <div className="mb-4 evo-card border border-amber-400/30 bg-amber-400/5 p-4">
            <h3 className="font-semibold text-amber-200">Cart updates need your approval</h3>
            <ul className="mt-2 space-y-1 text-sm text-evo-muted">
              {cartChanges.map((change) => (
                <li key={change.item.productId}>
                  <span className="text-white">{change.item.name}:</span>{' '}
                  {change.unavailable && `only ${change.product?.stockQuantity ?? 0} available; this item will be removed.`}
                  {change.unavailable && change.priceChanged && ' '}
                  {change.priceChanged && `price changed from ₹${Number(change.item.price).toFixed(2)} to ₹${change.currentPrice.toFixed(2)}.`}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={acknowledgeCartChanges}
              className="evo-btn-secondary evo-focus-ring mt-3 rounded-full px-4 py-1.5 text-sm"
            >
              Acknowledge and update cart
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-3 space-y-6">
            {step === 'form' && (
              <>
                <div className="evo-card p-4">
                  <h3 className="font-semibold text-white mb-3">Delivery Address</h3>

                  {loadingAddresses && (
                    <p className="text-sm text-evo-muted mb-3">Loading your addresses…</p>
                  )}

                  {addressesError && (
                    <p className="text-sm text-red-400 mb-3">{addressesError}</p>
                  )}

                  {addresses.length > 0 && !showAddressForm && (
                    <div className="space-y-2 mb-4">
                      {addresses.map((a) => (
                        <label key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-evo-violet/40 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={String(selectedAddressId) === String(a.id)}
                            onChange={() => setSelectedAddressId(String(a.id))}
                            className="mt-1"
                          />
                          <div className="text-evo-muted">
                            <p className="text-white font-medium">{a.fullName} · {a.phone} <span className="text-xs text-evo-blue">({a.addressType})</span></p>
                            <p>{[a.houseNo, a.buildingName, a.streetNo, a.streetName, a.area].filter(Boolean).join(', ')}</p>
                            <p>{a.city}, {a.state} - {a.pincode}, {a.country}</p>
                          </div>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="evo-btn-secondary evo-focus-ring text-sm px-4 py-1.5 rounded-full"
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-evo-muted mb-2">Customer Information</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {field('fullName', 'Full Name')}
                          {field('phone', 'Mobile Number (10 digits)')}
                        </div>
                        <div className="mt-3">{field('email', 'Email Address (optional)')}</div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-evo-muted mb-2">Address</p>
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
                              <input type="radio" name="addressType" value={t}
                                checked={addressForm.addressType === t} onChange={handleAddressChange} />
                              {t.charAt(0) + t.slice(1).toLowerCase()}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {addresses.length > 0 && (
                          <button type="button" onClick={() => setShowAddressForm(false)}
                            className="evo-btn-secondary evo-focus-ring px-4 py-1.5 rounded-full text-sm">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="evo-card p-4">
                  <h3 className="font-semibold text-white mb-3">Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 hover:border-evo-violet/40 cursor-pointer text-sm text-evo-muted">
                        <input type="radio" name="paymentMethod" value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={(e) => setPaymentMethod(e.target.value)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={goToReview}
                  disabled={savingAddress || validatingCart || cartChanges.length > 0}
                  className="evo-btn-primary evo-focus-ring w-full py-2.5 rounded-full disabled:opacity-60"
                >
                  {savingAddress ? 'Saving...' : validatingCart ? 'Checking cart...' : 'Continue to Review'}
                </button>
              </>
            )}

            {step === 'review' && selectedAddress && (
              <>
                <div className="evo-card p-4">
                  <h3 className="font-semibold text-white mb-2">Customer Details</h3>
                  <p className="text-sm text-evo-muted">{selectedAddress.fullName} · {selectedAddress.phone}</p>
                  {selectedAddress.email && <p className="text-sm text-evo-muted">{selectedAddress.email}</p>}
                </div>

                <div className="evo-card p-4">
                  <h3 className="font-semibold text-white mb-2">Delivery Address</h3>
                  <p className="text-sm text-evo-muted">
                    {[selectedAddress.houseNo, selectedAddress.buildingName, selectedAddress.streetNo, selectedAddress.streetName, selectedAddress.area].filter(Boolean).join(', ')}
                    {selectedAddress.landmark ? ` (Near ${selectedAddress.landmark})` : ''}
                  </p>
                  <p className="text-sm text-evo-muted">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}, {selectedAddress.country}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-evo-blue/15 text-evo-blue border border-evo-blue/25">{selectedAddress.addressType}</span>
                </div>

                <div className="evo-card p-4">
                  <h3 className="font-semibold text-white mb-2">Payment Method</h3>
                  <p className="text-sm text-evo-muted">{PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('form')} className="evo-btn-secondary evo-focus-ring px-6 py-2 rounded-full">
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="evo-btn-primary evo-focus-ring flex-1 py-2 rounded-full disabled:opacity-60"
                  >
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY */}
          <div className="lg:col-span-2">
            <div className="evo-card p-4 sticky top-6">
              <h3 className="font-semibold text-white mb-3">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map((c) => (
                  <div key={c.productId} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-evo-violet/10 border border-evo-violet/25 flex items-center justify-center text-evo-violet text-lg font-bold shrink-0">
                      {c.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{c.name}</p>
                      <p className="text-xs text-evo-muted">₹{c.price} each</p>
                    </div>
                    {step === 'form' ? (
                      <input
                        type="number"
                        min="1"
                        value={c.quantity}
                        onChange={(e) => updateQty(c.productId, parseInt(e.target.value) || 1)}
                        className="evo-input evo-focus-ring w-14 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-sm text-evo-muted">x{c.quantity}</span>
                    )}
                    <span className="text-sm text-white font-medium w-16 text-right">₹{(c.price * c.quantity).toFixed(2)}</span>
                    {step === 'form' && (
                      <button onClick={() => removeItem(c.productId)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>

              {step === 'form' && (
                <div className="flex gap-2 mb-4">
                  <input
                    placeholder="Coupon code (optional)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="evo-input evo-focus-ring flex-1 rounded px-3 py-1.5 text-sm"
                  />
                </div>
              )}

              <div className="space-y-2 text-sm border-t border-white/10 pt-3">
                <div className="flex justify-between text-evo-muted">
                  <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-evo-muted">
                  <span>GST (18%)</span><span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-evo-muted">
                  <span>Delivery Charge</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-evo-muted/70">Free delivery on orders above ₹{FREE_DELIVERY_THRESHOLD}</p>
                )}
                <div className="flex justify-between text-white font-bold text-base border-t border-white/10 pt-2 mt-2">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-evo-muted/70">Coupon discount, if applicable, is applied when the order is placed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
